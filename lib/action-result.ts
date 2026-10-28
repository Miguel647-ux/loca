export type ActionResult<T = undefined> =
  | {
      success: true;
      data?: T;
      message?: string;
      redirectTo?: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };