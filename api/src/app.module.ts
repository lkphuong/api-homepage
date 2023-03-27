import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { modules } from './app.imports';

import { applyMiddlewares } from './utils';

@Module({
  imports: modules,
  controllers: [],
  providers: [],
})
export class AppModule {}
//  implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     applyMiddlewares(consumer);
//   }
// }
