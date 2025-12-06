// src/controllers/lessonController.js
import { validationResult } from 'express-validator';
import * as lessonModel from '../models/lessonModel.js';

export const createLesson = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { course_id, title, slug, summary, order_number, duration_seconds } = req.body;
    const lesson = await lessonModel.createLesson({ course_id, title, slug, summary, order_number, duration_seconds });
    res.status(201).json({ lesson });
  } catch (err) {
    next(err);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patch = req.body;
    const lesson = await lessonModel.updateLesson(id, patch);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
};

export const getLesson = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const lesson = await lessonModel.findLessonById(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
};

export const listLessonsForCourse = async (req, res, next) => {
  try {
    const course_id = Number(req.params.courseId);
    const limit = Number(req.query.limit) || 100;
    const offset = Number(req.query.offset) || 0;
    const lessons = await lessonModel.listLessonsForCourse(course_id, { limit, offset });
    res.json({ lessons });
  } catch (err) {
    next(err);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const lesson = await lessonModel.softDeleteLesson(id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ lesson });
  } catch (err) {
    next(err);
  }
};
