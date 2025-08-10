// User
export type User = {
    id: string;
    name: string;
    last_name: string;
    email: string;
    password: string;
    language: string;
    profile_picture?: { url: string };
    github?: string;
    linkedin?: string;
    personal_website?: string;
    purchasedCourses: Course[];
  };
  
  // Course Structure
  export type Course = {
    id: string;
    name: string;
    slug: string;
    url?: string;
    enabled: boolean;
    startDate?: string;
    endDate?: string;
    language: 'en' | 'ru' | string;
    sections: Section[];
  };
  
  export type Section = {
    id: string;
    title: string;
    slug: string;
    order: number;
    modules: Module[];
    parentCourse: Course;
  };
  
  export type Module = {
    id: string;
    title: string;
    slug: string;
    order: number;
    weeks: Week[];
    parentSection: Section;
  };
  
  export type Week = {
    id: string;
    title: string;
    slug: string;
    order: number;
    days: Day[];
    parentModule: Module;
  };
  
  export type Day = {
    id: string;
    title: string;
    slug: string;
    order: number;
    lessons: Lesson[];
    parentWeek: Week;
  };

  export type DayLite = {
    id: string;
    title: string;
    slug: string;
    order: number;
    parentWeek: {
      id: string;
      title: string;
      slug: string;
    };
    lessons: {
      id: string;
      title: string;
      slug: string;
      lessonType: Lesson["lessonType"];
      isMandatory: boolean;
    }[];
  };

  export type ExtraResourceBlock = {
    _modelApiKey: "extra_resource_block";
    title: string;
    url: string;
  };
  
  export type Lesson = {
    id: string;
    title: string;
    slug: string;
    lessonType: 'Lesson' | 'Lab' | 'Assessment' | 'Class Recording' | 'Extra';
    isMandatory: boolean;
    content: DatoCmsLessonBlock[];
    extraResources?: ExtraResourceBlock[]; 
    parentDay: Day;
  };
  
    export type DatoCmsLessonBlock =
    | {
        __typename: "TextBlock";
        id: string;
        title?: string;
        content: string;
        subsections?: {
          id: string;
          text: string;
        }[];
      }
    | {
        __typename: 'ImageBlock';
        id: string;
        title?: string;
        image_content: { url: string };
      }
    | {
        __typename: 'VideoBlock';
        id: string;
        title?: string;
        video_url: string;
      }
    | {
        __typename: 'PresentationBlock';
        id: string;
        title?: string;
        code: string;
      }
    | {
        __typename: 'AlertBlock';
        id: string;
        text: string;
        background_color: string;
        text_color: string;
      };
  
  // Util
  export type CoursesGrouped = {
    purchased: Course[];
    nonPurchased: Course[];
  };