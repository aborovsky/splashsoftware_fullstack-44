import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

type WSError = {
  status: 'error';
  code: HttpStatus;
  message: string;
};

@Catch(WsException, HttpException)
export class WsExceptionFilter extends BaseWsExceptionFilter<
  HttpException | WsException
> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  handleError<TClient extends { emit: Function }>(
    client: TClient,
    exception: HttpException | WsException,
  ) {
    if (exception instanceof HttpException) {
      client.emit({
        code: exception.getStatus(),
        message: exception.message,
      } as WSError);
    } else {
      super.handleError(client, exception);
    }
  }
}
