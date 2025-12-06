import express from "express";
import * as chapterController from "../controllers/chapterController.js";
import * as testQuestionController from "../controllers/testQuestionController.js";
import { addTestQuestionsToChapter } from "../controllers/ChapterTestController.js";

const router = express.Router();

/* CHAPTER ROUTES */
router.post("/", chapterController.createChapter);
router.get("/:id", chapterController.getChapter);
router.put("/:id", chapterController.updateChapter);
router.delete("/:id", chapterController.deleteChapter);
router.get("/lesson/:lessonId", chapterController.listChaptersForLesson);

/* TEST QUESTION ROUTES */
router.post("/test-question", testQuestionController.createTestQuestion);
router.get("/test-question/:id", testQuestionController.getTestQuestion);
router.delete("/test-question/:id", testQuestionController.deleteTestQuestion);
router.get("/test-questions/lesson/:lessonId", testQuestionController.listTestQuestions);

/* ADD TEST QUESTIONS TO A CHAPTER */
router.post("/:chapterId/add-test-questions", addTestQuestionsToChapter);

export default router;
