// Catálogo de ENUMs — espelha o Dicionário de Dados (seção 8) e o schema.sql.

export enum UserRole {
  ABORDAGEM = 'ABORDAGEM',
  CASA = 'CASA',
  GESTAO = 'GESTAO',
  ADMIN = 'ADMIN',
}

export enum Gender {
  MASC = 'MASC',
  FEM = 'FEM',
  OUTRO = 'OUTRO',
}

export enum Region {
  OESTE = 'OESTE',
  NORTE = 'NORTE',
  LESTE = 'LESTE',
  SUL = 'SUL',
  NORDESTE = 'NORDESTE',
  OUTROS_ESTADOS = 'OUTROS_ESTADOS',
}

export enum Ethnicity {
  BRANCA = 'BRANCA',
  PARDA = 'PARDA',
  PRETA = 'PRETA',
  INDIGENA = 'INDIGENA',
  NAO_INFORMADA = 'NAO_INFORMADA',
  OUTRA = 'OUTRA',
}

export enum Education {
  NAO_ALFABETIZADO = 'NAO_ALFABETIZADO',
  FUND_INC = 'FUND_INC',
  FUND = 'FUND',
  MEDIO_INC = 'MEDIO_INC',
  MEDIO = 'MEDIO',
  SUP_INC = 'SUP_INC',
  SUP = 'SUP',
  NAO_INFORMADO = 'NAO_INFORMADO',
}

export enum IncomeType {
  BPC = 'BPC',
  BOLSA_FAMILIA = 'BOLSA_FAMILIA',
  SEM_BENEFICIO = 'SEM_BENEFICIO',
  NAO_INFORMADO = 'NAO_INFORMADO',
  OUTRA = 'OUTRA',
}

export enum DemandType {
  TELEFONE_0800 = 'TELEFONE_0800',
  BUSCA_ATIVA = 'BUSCA_ATIVA',
  OUTRO = 'OUTRO',
}

export enum Period {
  DIA = 'DIA',
  NOITE = 'NOITE',
}

export enum DestinationType {
  CP1 = 'CP1',
  CP2 = 'CP2',
  CP3 = 'CP3',
  CENTRO_POP = 'CENTRO_POP',
  CRAS = 'CRAS',
  CRAM = 'CRAM',
  CAPS_AD = 'CAPS_AD',
  CAPS_II = 'CAPS_II',
  CAPS_I = 'CAPS_I',
  SAUDE = 'SAUDE',
  INSS = 'INSS',
  JUSTICA = 'JUSTICA',
  EDUCACAO = 'EDUCACAO',
  SEGURANCA = 'SEGURANCA',
  OUTRO = 'OUTRO',
}

export enum ReferralBy {
  EQUIPE_ABORDAGEM = 'EQUIPE_ABORDAGEM',
  CENTRO_POP = 'CENTRO_POP',
}

export enum ReferralStatus {
  PENDENTE = 'PENDENTE',
  CONFIRMADO = 'CONFIRMADO',
  RECUSADO = 'RECUSADO',
  CANCELADO = 'CANCELADO',
}

export enum ExitReason {
  ALTA = 'ALTA',
  FUGA = 'FUGA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  ENCERRAMENTO_SERVICO = 'ENCERRAMENTO_SERVICO',
  OUTRO = 'OUTRO',
}

export enum PartnerStatus {
  ATIVA = 'ATIVA',
  ANALISE = 'ANALISE',
  INATIVA = 'INATIVA',
}

// Ações de auditoria (audit_logs.action é VARCHAR aberto — RN-030)
export enum AuditAction {
  CREATE_PERSON = 'CREATE_PERSON',
  UPDATE_PERSON = 'UPDATE_PERSON',
  CREATE_APPROACH = 'CREATE_APPROACH',
  UPDATE_APPROACH = 'UPDATE_APPROACH',
  CREATE_REFERRAL = 'CREATE_REFERRAL',
  UPDATE_REFERRAL = 'UPDATE_REFERRAL',
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
}
