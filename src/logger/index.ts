import * as winston from 'winston';

const getLogConfig = () => ({ level: 'info' });

const getErrorConfig = () => ({
	level: 'error',
	filename: './logs/errors.log',
});

const getTransports = () => ([
	new winston.transports.Console(getLogConfig()),
	new winston.transports.File(getErrorConfig()),
]);

const getLoggerConfig = () => ({ transports: getTransports() });

export default () => winston.createLogger(getLoggerConfig());