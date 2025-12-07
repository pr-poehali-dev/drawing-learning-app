-- Create users table for storing user profiles and progress
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT,
    level VARCHAR(50) DEFAULT 'Новичок',
    total_xp INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    duration INTEGER NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table to track completed lessons
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    lesson_id INTEGER NOT NULL REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    UNIQUE(user_id, lesson_id)
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_minutes INTEGER NOT NULL,
    points INTEGER NOT NULL,
    icon VARCHAR(50),
    difficulty VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_exercises table to track completed exercises
CREATE TABLE IF NOT EXISTS user_exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    exercise_id INTEGER NOT NULL REFERENCES exercises(id),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_spent INTEGER,
    score INTEGER
);

-- Create gallery table for user artworks
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(255),
    description TEXT,
    image_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gallery_likes table
CREATE TABLE IF NOT EXISTS gallery_likes (
    id SERIAL PRIMARY KEY,
    gallery_id INTEGER NOT NULL REFERENCES gallery(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(gallery_id, user_id)
);

-- Create gallery_comments table
CREATE TABLE IF NOT EXISTS gallery_comments (
    id SERIAL PRIMARY KEY,
    gallery_id INTEGER NOT NULL REFERENCES gallery(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    achievement_id INTEGER NOT NULL REFERENCES achievements(id),
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Insert initial lessons
INSERT INTO lessons (title, description, content, duration, difficulty, icon, order_index) VALUES
('Основы пропорций лица', 'Научитесь правильно размещать черты лица', 'В этом уроке вы узнаете базовые пропорции человеческого лица. Лицо делится на три равные части: от линии роста волос до бровей, от бровей до кончика носа, и от кончика носа до подбородка. Глаза располагаются на середине головы. Расстояние между глазами равно ширине одного глаза. Уши находятся между линией бровей и линией носа.', 15, 'Начальный', 'Ruler', 1),
('Рисуем глаза', 'Пошаговая инструкция по рисованию реалистичных глаз', 'Глаза — зеркало души. Начнем с формы миндаля. Верхнее веко всегда толще нижнего. Радужка частично скрыта верхним веком. Не забудьте про блики на зрачке — они оживляют взгляд. Ресницы растут от века, а не от линии. Нижние ресницы короче верхних.', 25, 'Средний', 'Eye', 2),
('Техника рисования носа', 'Изучаем анатомию и светотень носа', 'Нос состоит из переносицы, спинки, кончика и крыльев. Начните с простой треугольной формы. Добавьте детали: ноздри имеют форму запятых. Светотень создает объем: самое светлое место — спинка носа, самое темное — под кончиком и в ноздрях.', 20, 'Средний', 'Wind', 3),
('Губы и рот', 'Создаём объём и выразительность', 'Губы имеют М-образную форму сверху и волнистую снизу. Центральная линия рта — самая темная. Верхняя губа обычно темнее нижней. Нижняя губа получает больше света. Уголки рта слегка уходят в тень. Добавьте блик на нижней губе для объема.', 30, 'Средний', 'Smile', 4);

-- Insert initial exercises
INSERT INTO exercises (title, description, time_minutes, points, icon, difficulty) VALUES
('Быстрый скетч портрета', 'Нарисуйте портрет за 5 минут, чтобы развить скорость и уверенность линий', 5, 50, 'Timer', 'Начальный'),
('Практика пропорций', 'Нарисуйте 5 лиц с правильными пропорциями', 10, 100, 'Target', 'Начальный'),
('Светотень', 'Создайте объем с помощью штриховки на простой форме', 15, 150, 'Sun', 'Средний'),
('Детали глаз', 'Нарисуйте 10 разных глаз с разными выражениями', 20, 200, 'Eye', 'Средний'),
('Портрет с натуры', 'Нарисуйте портрет реального человека или с фотографии', 30, 300, 'UserCircle', 'Продвинутый');

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value) VALUES
('Первый урок', 'Завершите ваш первый урок', 'Award', 'lessons_completed', 1),
('Неделя практики', 'Занимайтесь 7 дней подряд', 'Calendar', 'daily_streak', 7),
('Мастер глаз', 'Завершите все уроки по глазам', 'Eye', 'specific_lesson', 2),
('100 скетчей', 'Выполните 100 упражнений', 'Sparkles', 'exercises_completed', 100),
('Популярный художник', 'Получите 500 лайков на ваши работы', 'Heart', 'total_likes', 500);
