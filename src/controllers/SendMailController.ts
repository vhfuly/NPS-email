import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { resolve } from 'path';
import * as yup from 'yup';

import { UsersRepository } from '../repositories/UsersRepository';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import SendMailService from '../services/SendMailService';
import { AppError } from '../errors/AppError';


class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } =request.body;

    const schema = yup.object().shape({
      email: yup.string().email().required(),
      survey_id: yup.string().required(),
    })

    try {
      await schema.validate(request.body, { abortEarly: false })
    } catch (err) {
      return response.status(400).json({ error: err });
    }

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });

    if (!user) {
      throw new AppError('User does not exists!');
    }

    const survey = await surveysRepository.findOne({ id: survey_id });

    if (!survey) {
      throw new AppError('Survey does not exists!');
    }


    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: {user_id: user.id, value: null},
      relations: ['user', 'survey'],
    })

    const npsPath = resolve(__dirname,'..','views', 'emails','npsMail.hbs');

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: '',
      link: process.env.URL_MAIL,
    };

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email,survey.title, variables , npsPath)
      return response.json(surveyUserAlreadyExists)
    }

    const  surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    })

    await surveysUsersRepository.save(surveyUser)
    
    variables.id = surveyUser.id;
    await SendMailService.execute(email,survey.title, variables , npsPath)

    return response.json(surveyUser)

  }
}

export { SendMailController }
