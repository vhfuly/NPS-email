import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';

import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';

class AnswerController {
  // http://localhost:3333/answers/10?u=8d0c75e4-073a-430c-ba18-09f4c6376451
  async execute(request: Request, response: Response) {
    const { value } = request.params;
    const { u } = request.query;

    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const surveyUser = await surveysUsersRepository.findOne({
      id: String(u)
    });

    if(!surveyUser) {
      return response.status(400).json({
        error: 'SurveyUser does not exists!'
      })
    }

    if(surveyUser.value) {
      return response.status(400).json({
        error: 'Cannot vote again!'
      })
    }

    surveyUser.value = Number(value);

    await surveysUsersRepository.save(surveyUser);

    return response.json(surveyUser);

  }
}

export { AnswerController }