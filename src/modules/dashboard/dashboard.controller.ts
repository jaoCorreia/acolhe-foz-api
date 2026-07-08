import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardFilterDto, RecurrenceDto, TimeseriesDto } from './dto/dashboard.dto';
import { Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';

// Todo o BI é restrito a GESTAO e ADMIN (RF-050..RF-060).
@ApiTags('dashboard')
@ApiBearerAuth()
@Roles(UserRole.GESTAO, UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary() {
    return this.dashboardService.summary();
  }

  @Get('heatmap')
  heatmap(@Query() f: DashboardFilterDto) {
    return this.dashboardService.heatmap(f);
  }

  @Get('top-locations')
  topLocations(@Query() f: DashboardFilterDto) {
    return this.dashboardService.topLocations(f);
  }

  @Get('timeseries')
  timeseries(@Query() f: TimeseriesDto) {
    return this.dashboardService.timeseries(f);
  }

  @Get('occupancy')
  occupancy() {
    return this.dashboardService.occupancy();
  }

  @Get('demographics')
  demographics(@Query() f: DashboardFilterDto) {
    return this.dashboardService.demographics(f);
  }

  @Get('violations')
  violations(@Query() f: DashboardFilterDto) {
    return this.dashboardService.violations(f);
  }

  @Get('recurrence')
  recurrence(@Query() f: RecurrenceDto) {
    return this.dashboardService.recurrence(f);
  }
}
