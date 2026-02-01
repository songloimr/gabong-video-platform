import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { RequestMetricsService } from '../../modules/system-metrics/request-metrics.service';

@Injectable()
export class RequestMetricsInterceptor implements NestInterceptor {
  constructor(private readonly requestMetricsService: RequestMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const method = request.method;
    const route = request.route?.path || request.url;

    this.requestMetricsService.incrementActiveConnections();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        this.requestMetricsService.recordRequest(
          method,
          route,
          statusCode,
          duration,
        );
        this.requestMetricsService.decrementActiveConnections();
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;
        this.requestMetricsService.recordRequest(
          method,
          route,
          statusCode,
          duration,
        );
        this.requestMetricsService.decrementActiveConnections();
        throw error;
      }),
    );
  }
}
