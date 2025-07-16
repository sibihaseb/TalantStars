import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  category: string;
  message: string;
  data?: any;
  userId?: number;
  sessionId?: string;
  url?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
}

class Logger {
  private logFile: string;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 log entries in memory

  constructor() {
    this.logFile = path.join(process.cwd(), 'debug.log');
    this.initLogFile();
  }

  private initLogFile() {
    if (!fs.existsSync(this.logFile)) {
      fs.writeFileSync(this.logFile, '');
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const dataStr = entry.data ? `\nData: ${JSON.stringify(entry.data, null, 2)}` : '';
    return `[${entry.timestamp}] [${entry.level}] [${entry.category}] ${entry.message}${dataStr}\n`;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Write to file
    const logLine = this.formatLogEntry(entry);
    fs.appendFileSync(this.logFile, logLine);
    
    // Also log to console with color coding
    const colorCode = {
      INFO: '\x1b[36m',    // Cyan
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      DEBUG: '\x1b[90m'    // Gray
    }[entry.level];
    
    console.log(`${colorCode}[${entry.level}] [${entry.category}] ${entry.message}\x1b[0m`);
    if (entry.data) {
      console.log(`${colorCode}Data:`, entry.data, '\x1b[0m');
    }
  }

  info(category: string, message: string, data?: any, req?: any) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category,
      message,
      data,
      userId: req?.user?.id,
      sessionId: req?.sessionID,
      url: req?.url,
      method: req?.method,
      userAgent: req?.headers['user-agent'],
      ip: req?.ip
    });
  }

  warn(category: string, message: string, data?: any, req?: any) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      category,
      message,
      data,
      userId: req?.user?.id,
      sessionId: req?.sessionID,
      url: req?.url,
      method: req?.method,
      userAgent: req?.headers['user-agent'],
      ip: req?.ip
    });
  }

  error(category: string, message: string, data?: any, req?: any) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category,
      message,
      data,
      userId: req?.user?.id,
      sessionId: req?.sessionID,
      url: req?.url,
      method: req?.method,
      userAgent: req?.headers['user-agent'],
      ip: req?.ip
    });
  }

  debug(category: string, message: string, data?: any, req?: any) {
    this.addLog({
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      category,
      message,
      data,
      userId: req?.user?.id,
      sessionId: req?.sessionID,
      url: req?.url,
      method: req?.method,
      userAgent: req?.headers['user-agent'],
      ip: req?.ip
    });
  }

  // Media upload specific logging
  mediaUpload(message: string, data?: any, req?: any) {
    this.debug('MEDIA_UPLOAD', message, data, req);
  }

  // Authentication specific logging
  auth(message: string, data?: any, req?: any) {
    this.debug('AUTH', message, data, req);
  }

  // API request logging
  apiRequest(message: string, data?: any, req?: any) {
    this.debug('API_REQUEST', message, data, req);
  }

  // Database operations
  database(message: string, data?: any, req?: any) {
    this.debug('DATABASE', message, data, req);
  }

  // File operations
  file(message: string, data?: any, req?: any) {
    this.debug('FILE_OPS', message, data, req);
  }

  // Get recent logs
  getRecentLogs(count: number = 100, level?: string, category?: string): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    
    return filteredLogs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    fs.writeFileSync(this.logFile, '');
  }

  // Get log file path
  getLogFilePath() {
    return this.logFile;
  }
}

export const logger = new Logger();