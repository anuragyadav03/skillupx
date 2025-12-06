// src/controllers/chapterController.js
import { validationResult } from 'express-validator';
import * as chapterModel from '../models/chapterModel.js';

/* -------------------------------------------------------
   CREATE CHAPTER
------------------------------------------------------- */
export const createChapter = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      lesson_id,
      title,
      content_type,
      video_url,
      resource_path,
      test_questions,
      chapter_name,
      timed,
      active
    } = req.body;

    const chapter = await chapterModel.createChapter({
      lesson_id,
      title,
      content_type,
      video_url,
      resource_path,
      test_questions,
      chapter_name,
      timed,
      active
    });

    res.status(201).json({ chapter });

  } catch (err) {
    next(err);
  }
};


/* -------------------------------------------------------
   UPDATE CHAPTER
------------------------------------------------------- */
export const updateChapter = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patch = req.body;

    const chapter = await chapterModel.updateChapter(id, patch);
    if (!chapter)
      return res.status(404).json({ message: 'Chapter not found' });

    res.json({ chapter });

  } catch (err) {
    next(err);
  }
};


/* -------------------------------------------------------
   GET CHAPTER
------------------------------------------------------- */
export const getChapter = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const chapter = await chapterModel.findChapterById(id);

    if (!chapter)
      return res.status(404).json({ message: 'Chapter not found' });

    res.json({ chapter });

  } catch (err) {
    next(err);
  }
};


/* -------------------------------------------------------
   LIST CHAPTERS FOR LESSON
------------------------------------------------------- */
export const listChaptersForLesson = async (req, res, next) => {
  try {
    const lesson_id = Number(req.params.lessonId);
    const limit = Number(req.query.limit) || 100;
    const offset = Number(req.query.offset) || 0;

    const chapters = await chapterModel.fetchAllChaptersByLessonId(lesson_id, {
      limit,
      offset
    });

    res.json({ chapters });

  } catch (err) {
    next(err);
  }
};


/* -------------------------------------------------------
   SOFT DELETE (active = false)
------------------------------------------------------- */
export const deleteChapter = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const chapter = await chapterModel.softDeleteChapter(id);
    if (!chapter)
      return res.status(404).json({ message: 'Chapter not found' });

    res.json({ chapter });

  } catch (err) {
    next(err);
  }
};
