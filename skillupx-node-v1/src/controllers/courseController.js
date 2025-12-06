// src/controllers/courseController.js
import { validationResult } from 'express-validator';
import * as courseModel from '../models/courseModel.js';

/**
 * Create course controller
 * Catches unique-constraint errors (slug) and returns 409.
 */
export const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, slug, short_description, long_description, price, currency, is_published } = req.body;

    try {
      const course = await courseModel.createCourse({
        title,
        slug,
        short_description,
        long_description,
        price,
        currency,
        is_published
      });
      return res.status(201).json({ course });
    } catch (err) {
      // handle postgres unique violation (e.g., slug unique)
      if (err && err.code === '23505') {
        // try to extract constraint/column from error, fallback generic message
        const detail = err.detail || 'Unique constraint violation';
        return res.status(409).json({ message: 'Conflict: duplicate value', detail });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patch = req.body || {};

    // Defensive: remove instructor_id if client still sending it
    if ('instructor_id' in patch) delete patch.instructor_id;

    const course = await courseModel.updateCourse(id, patch);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    // unique constraint handling on update as well
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'Conflict: duplicate value', detail: err.detail });
    }
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const course = await courseModel.findCourseById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

export const listCourses = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const offset = Number(req.query.offset) || 0;
    const publishedOnly = req.query.published === 'true';
    const courses = await courseModel.listCourses({ limit, offset, publishedOnly });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const course = await courseModel.softDeleteCourse(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};
