import CrudController from '../../models/crud.controller';
import ServiceRepository from './service.repository';

class ServiceController extends CrudController {

  constructor() {
    super(ServiceRepository);
  }

}

export default new ServiceController;
