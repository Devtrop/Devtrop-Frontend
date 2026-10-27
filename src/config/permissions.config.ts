export const PERMISSIONS = {
  // ============================================================
  // USER
  // ============================================================

  USER_READ: 'user.read',
  USER_STATUS_UPDATE: 'user.status.update',
  USER_ROLE_UPDATE: 'user.role.update',
  USER_DEACTIVATE: 'user.deactivate',
  USER_DELETE: 'user.delete',
  USER_RESTORE: 'user.restore',

  // User self-service
  USER_PROFILE_UPDATE: 'user.profile.update',
  USER_PASSWORD_CHANGE: 'user.password.change',
  USER_EMAIL_CHANGE: 'user.email.change',
  USER_AVATAR_UPDATE: 'user.avatar.update',

  // ============================================================
  // HIRING / JOB POST
  // ============================================================

  JOB_POST_READ: 'job_post.read',
  JOB_POST_CREATE: 'job_post.create',
  JOB_POST_UPDATE: 'job_post.update',
  JOB_POST_DELETE: 'job_post.delete',

  // ============================================================
  // APPLICATION
  // ============================================================

  APPLICATION_READ: 'application.read',
  APPLICATION_UPDATE: 'application.update',

  // ============================================================
  // INTERVIEW
  // ============================================================

  INTERVIEW_READ: 'interview.read',
  INTERVIEW_SLOT_MANAGE: 'interview.slot.manage',
  INTERVIEW_INVITE: 'interview.invite',
  INTERVIEW_RESCHEDULE: 'interview.reschedule',
  INTERVIEW_EVALUATE: 'interview.evaluate',
  INTERVIEW_OUTCOME: 'interview.outcome',
  INTERVIEW_CANCEL: 'interview.cancel',

  // ============================================================
  // TASK
  // ============================================================

  TASK_CREATE: 'task.create',
  TASK_UPDATE: 'task.update',
  TASK_DELETE: 'task.delete',

  // ============================================================
  // ROLE
  // ============================================================

  ROLE_READ: 'role.read',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',

  // ============================================================
  // DOCUMENT
  // ============================================================

  DOCUMENT_READ: 'document.read',
  DOCUMENT_DELETE: 'document.delete',

  // ============================================================
  // PERMISSION
  // ============================================================

  PERMISSION_READ: 'permission.read',
  PERMISSION_ASSIGN: 'permission.assign',

  // ============================================================
  // CLIENT
  // ============================================================

  CLIENT_CREATE: 'client.create',
  CLIENT_READ: 'client.read',
  CLIENT_UPDATE: 'client.update',
  CLIENT_DELETE: 'client.delete',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
export type AppPermission = Permission
