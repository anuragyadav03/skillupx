import { validationResult } from "express-validator";
import * as testModel from "../models/testQuestionModel.js";
import * as chapterModel from "../models/chapterModel.js";

export const createTestQuestion = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const question = await testModel.createTestQuestion(req.body);
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
};

export const listTestQuestions = async (req, res, next) => {
  try {
    const lesson_id = Number(req.params.lessonId);
    const questions = await testModel.listTestQuestions(lesson_id);
    res.json({ questions });
  } catch (err) {
    next(err);
  }
};

export const getTestQuestion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const question = await testModel.findTestQuestionById(id);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};

export const deleteTestQuestion = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const question = await testModel.softDeleteTestQuestion(id);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json({ question });
  } catch (err) {
    next(err);
  }
};
