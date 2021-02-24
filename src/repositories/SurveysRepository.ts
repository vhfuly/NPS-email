import { Repository, EntityRepository } from 'typeorm'

import { Surveys } from '../models/Surveys'

@EntityRepository(Surveys)
class SurveysRepository extends Repository<Surveys> {}

export { SurveysRepository }