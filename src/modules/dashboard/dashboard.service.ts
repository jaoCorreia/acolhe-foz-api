import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DashboardFilterDto, RecurrenceDto, TimeseriesDto } from './dto/dashboard.dto';

// Constrói cláusula WHERE comum às consultas de abordagem a partir dos filtros.
function buildApproachFilter(f: DashboardFilterDto, params: any[]): string {
  const clauses = ['a.deleted_at IS NULL'];
  if (f.from) {
    params.push(f.from);
    clauses.push(`a.approach_date >= $${params.length}`);
  }
  if (f.to) {
    params.push(f.to);
    clauses.push(`a.approach_date <= $${params.length}`);
  }
  if (f.period) {
    params.push(f.period);
    clauses.push(`a.period = $${params.length}`);
  }
  if (f.violation) {
    params.push(f.violation);
    clauses.push(`$${params.length} = ANY(a.violations)`);
  }
  return clauses.join(' AND ');
}

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  // RF-050: KPIs gerais.
  async summary() {
    const [row] = await this.ds.query(`
      SELECT
        (SELECT count(*) FROM approaches WHERE deleted_at IS NULL AND approach_date::date = CURRENT_DATE) AS approaches_today,
        (SELECT count(*) FROM approaches WHERE deleted_at IS NULL AND date_trunc('month', approach_date) = date_trunc('month', CURRENT_DATE)) AS approaches_month,
        (SELECT count(*) FROM approaches WHERE deleted_at IS NULL AND date_trunc('year', approach_date) = date_trunc('year', CURRENT_DATE)) AS approaches_year,
        (SELECT count(*) FROM persons WHERE deleted_at IS NULL AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)) AS new_persons_month,
        (SELECT count(*) FROM persons WHERE deleted_at IS NULL) AS total_persons,
        (SELECT count(*) FROM referrals WHERE deleted_at IS NULL) AS total_referrals,
        (SELECT count(*) FROM referrals WHERE deleted_at IS NULL AND status = 'CONFIRMADO') AS confirmed_referrals,
        (SELECT coalesce(sum(current_occupancy),0) FROM shelters WHERE deleted_at IS NULL) AS occupied,
        (SELECT coalesce(sum(total_capacity),0) FROM shelters WHERE deleted_at IS NULL) AS capacity,
        (SELECT count(*) FROM shelters WHERE deleted_at IS NULL AND total_capacity > 0 AND current_occupancy::float / total_capacity >= 0.9) AS critical_shelters
    `);
    const capacity = Number(row.capacity) || 0;
    const occupied = Number(row.occupied) || 0;
    const totalReferrals = Number(row.total_referrals) || 0;
    return {
      approachesToday: Number(row.approaches_today),
      approachesMonth: Number(row.approaches_month),
      approachesYear: Number(row.approaches_year),
      newPersonsMonth: Number(row.new_persons_month),
      totalPersons: Number(row.total_persons),
      referralsTotal: totalReferrals,
      referralsConfirmedRate: totalReferrals ? Math.round((Number(row.confirmed_referrals) / totalReferrals) * 100) : 0,
      networkOccupancyRate: capacity ? Math.round((occupied / capacity) * 100) : 0,
      occupied,
      capacity,
      criticalShelters: Number(row.critical_shelters),
    };
  }

  // RF-051: pontos para o mapa de calor (agregados por coordenada arredondada).
  async heatmap(f: DashboardFilterDto) {
    const params: any[] = [];
    const where = buildApproachFilter(f, params);
    const rows = await this.ds.query(
      `SELECT round(a.latitude, 4) AS lat, round(a.longitude, 4) AS lng, count(*)::int AS weight
       FROM approaches a
       WHERE ${where} AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL
       GROUP BY 1, 2
       ORDER BY weight DESC
       LIMIT 5000`,
      params,
    );
    return rows.map((r: any) => ({ lat: Number(r.lat), lng: Number(r.lng), weight: r.weight }));
  }

  // Ranking de locais com mais abordagens (leitura direta no mapa: nome + volume).
  async topLocations(f: DashboardFilterDto) {
    const params: any[] = [];
    const where = buildApproachFilter(f, params);
    const rows = await this.ds.query(
      `SELECT a.location_name AS name, count(*)::int AS total,
              avg(a.latitude)::float AS lat, avg(a.longitude)::float AS lng
       FROM approaches a
       WHERE ${where} AND a.latitude IS NOT NULL AND a.longitude IS NOT NULL
       GROUP BY a.location_name
       ORDER BY total DESC
       LIMIT 10`,
      params,
    );
    return rows.map((r: any) => ({ name: r.name, total: r.total, lat: r.lat, lng: r.lng }));
  }

  // RF-053: série temporal de abordagens.
  async timeseries(f: TimeseriesDto) {
    const granularity = ['day', 'week', 'month'].includes(f.granularity ?? '') ? f.granularity : 'day';
    const params: any[] = [];
    const where = buildApproachFilter(f, params);
    const rows = await this.ds.query(
      `SELECT date_trunc('${granularity}', a.approach_date) AS bucket, count(*)::int AS total
       FROM approaches a
       WHERE ${where}
       GROUP BY 1
       ORDER BY 1`,
      params,
    );
    return rows.map((r: any) => ({ date: r.bucket, total: r.total }));
  }

  // RF-052/RF-055: ocupação por casa em tempo real.
  async occupancy() {
    const rows = await this.ds.query(`
      SELECT id, name, target_profile, total_capacity, current_occupancy, latitude, longitude,
             CASE WHEN total_capacity > 0 THEN round(current_occupancy::numeric / total_capacity * 100) ELSE 0 END AS occupancy_rate
      FROM shelters
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      targetProfile: r.target_profile,
      totalCapacity: Number(r.total_capacity),
      currentOccupancy: Number(r.current_occupancy),
      availableSpots: Math.max(Number(r.total_capacity) - Number(r.current_occupancy), 0),
      occupancyRate: Number(r.occupancy_rate),
      isCritical: Number(r.occupancy_rate) >= 90,
      latitude: r.latitude !== null ? Number(r.latitude) : null,
      longitude: r.longitude !== null ? Number(r.longitude) : null,
    }));
  }

  // RF-054: distribuição demográfica.
  async demographics(f: DashboardFilterDto) {
    // Pessoas abordadas no período (distintas).
    const params: any[] = [];
    const where = buildApproachFilter(f, params);
    const personFilter = `p.deleted_at IS NULL AND p.id IN (SELECT DISTINCT a.person_id FROM approaches a WHERE ${where})`;

    const group = async (expr: string) =>
      this.ds.query(
        `SELECT ${expr} AS label, count(*)::int AS value
         FROM persons p WHERE ${personFilter}
         GROUP BY 1 ORDER BY value DESC`,
        params,
      );

    const [gender, ethnicity, education, nationality, ageGroups] = await Promise.all([
      group('p.gender::text'),
      group("coalesce(p.ethnicity::text, 'NAO_INFORMADA')"),
      group("coalesce(p.education::text, 'NAO_INFORMADO')"),
      group("coalesce(p.nationality, 'Não informado')"),
      this.ds.query(
        `SELECT
            CASE
              WHEN p.birth_date IS NULL THEN 'NAO_INF'
              WHEN date_part('year', age(p.birth_date)) < 13 THEN '0-12'
              WHEN date_part('year', age(p.birth_date)) < 18 THEN '13-17'
              WHEN date_part('year', age(p.birth_date)) < 60 THEN '18-59'
              ELSE '60+'
            END AS label,
            count(*)::int AS value
         FROM persons p WHERE ${personFilter}
         GROUP BY 1 ORDER BY 1`,
        params,
      ),
    ]);
    return { gender, ethnicity, education, nationality, ageGroups };
  }

  // RF-057: ranking de violações de direitos.
  async violations(f: DashboardFilterDto) {
    const params: any[] = [];
    const where = buildApproachFilter(f, params);
    const rows = await this.ds.query(
      `SELECT v AS label, count(*)::int AS value
       FROM approaches a, unnest(a.violations) AS v
       WHERE ${where}
       GROUP BY 1 ORDER BY value DESC`,
      params,
    );
    const totalApproaches = await this.ds.query(
      `SELECT count(*)::int AS total FROM approaches a WHERE ${where}`,
      params,
    );
    const total = totalApproaches[0]?.total || 0;
    return rows.map((r: any) => ({
      label: r.label,
      value: r.value,
      pct: total ? Math.round((r.value / total) * 100) : 0,
    }));
  }

  // RF-056: pessoas com N+ abordagens (casos crônicos).
  async recurrence(f: RecurrenceDto) {
    const params: any[] = [];
    const where = buildApproachFilter(f, params);
    params.push(f.minApproaches ?? 3);
    const minIdx = params.length;
    const rows = await this.ds.query(
      `SELECT p.id, p.name, p.cpf, p.gender::text AS gender,
              count(a.id)::int AS approaches_count,
              max(a.approach_date) AS last_approach
       FROM persons p
       JOIN approaches a ON a.person_id = p.id
       WHERE ${where} AND p.deleted_at IS NULL
       GROUP BY p.id, p.name, p.cpf, p.gender
       HAVING count(a.id) >= $${minIdx}
       ORDER BY approaches_count DESC
       LIMIT 200`,
      params,
    );
    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      cpf: r.cpf,
      gender: r.gender,
      approachesCount: r.approaches_count,
      lastApproach: r.last_approach,
    }));
  }
}
