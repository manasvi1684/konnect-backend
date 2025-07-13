// models/roleModel.js
import db from '../db/db.js';

export const createMentor = async (mentorData) => {
  try {
    await db('mentors').insert(mentorData);
  } catch (error) {
    console.error('Error creating mentor:', error);
    throw error;
  }
};

export const createMentee = async (menteeData) => {
  try {
    await  db('mentees').insert(menteeData);
  } catch (error) {
    console.error('Error creating mentee:', error);
    throw error;
  }
};

export const createStudent = async (studentData) => {
  try {
    await db('students').insert(studentData);
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};