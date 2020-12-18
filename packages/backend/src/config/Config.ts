import { Algorithm } from 'jsonwebtoken';

export interface Config {
  environmentName: string;
  development?: boolean;
  externalUrl: string;
  server: ServerConfig;
  database: DatabaseConfig;
  authentication: AuthenticationConfig;
  registration: RegistrationConfig;
  smtp: SmtpConfig;
}

export interface ServerConfig {
  host: string;
  port: number;
}

export interface DatabaseConfig {
  url: string;
  username: string;
  // TODO: encrypt passwords
  password: string;
}

export interface AuthenticationConfig {
  passwordSalt: string;
  jwtSecret: string;
  jwtAlgorithm: Algorithm;
  jwtExpiresIn: string;
}

export interface RegistrationConfig {
  confirmationSalt: string;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}
