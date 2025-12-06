import * as testModel from "../models/testQuestionModel.js";
import * as chapterModel from "../models/chapterModel.js";

export const addTestQuestionsToChapter = async (req, res, next) => {
  try {
    const chapterId = Number(req.params.chapterId);

    const chapter = await chapterModel.findChapterById(chapterId);
    if (!chapter)
      return res.status(404).json({ message: "Chapter not found" });

    // Chapter must be TEST type
    if (chapter.content_type !== "TEST") {
      return res
        .status(400)
        .json({ message: "Chapter is not a TEST chapter" });
    }

    const lesson_id = chapter.lesson_id;

    let questions = req.body;

    // Normalize to array
    if (!Array.isArray(questions)) questions = [questions];

    const created = [];

    for (const q of questions) {
      const data = {
        course_id: q.course_id ?? null,
        lesson_id,
        question_text: q.question_text,
        question_type: q.question_type || "mcq",
        points: q.points || 1,
        metadata: q.metadata || {},
      };
      const inserted = await testModel.createTestQuestion(data);
      created.push(inserted);
    }

    res.status(201).json({ chapterId, questions: created });
  } catch (err) {
    next(err);
  }
};
