import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с упражнениями
    GET / - получить все упражнения
    POST /complete - завершить упражнение с подсчетом XP
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute('''
            SELECT id, title, description, time_minutes, points, icon, difficulty
            FROM exercises
            ORDER BY points
        ''')
        rows = cur.fetchall()
        
        exercises = []
        for row in rows:
            exercises.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'time_minutes': row[3],
                'points': row[4],
                'icon': row[5],
                'difficulty': row[6]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(exercises, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        user_id = body_data.get('user_id')
        exercise_id = body_data.get('exercise_id')
        time_spent = body_data.get('time_spent')
        score = body_data.get('score', 100)
        
        if not user_id or not exercise_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id and exercise_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute('SELECT points FROM exercises WHERE id = %s', (exercise_id,))
        exercise_row = cur.fetchone()
        
        if not exercise_row:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Exercise not found'}),
                'isBase64Encoded': False
            }
        
        points = exercise_row[0]
        
        cur.execute('''
            INSERT INTO user_exercises (user_id, exercise_id, time_spent, score)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (user_id, exercise_id, time_spent, score))
        
        exercise_completion_id = cur.fetchone()[0]
        
        cur.execute('''
            UPDATE users
            SET total_xp = total_xp + %s
            WHERE id = %s
            RETURNING total_xp
        ''', (points, user_id))
        
        new_xp = cur.fetchone()[0]
        
        cur.execute('''
            SELECT COUNT(*) FROM user_exercises WHERE user_id = %s
        ''', (user_id,))
        total_exercises = cur.fetchone()[0]
        
        cur.execute('''
            SELECT a.id, a.name
            FROM achievements a
            WHERE a.requirement_type = 'exercises_completed' 
            AND a.requirement_value <= %s
            AND NOT EXISTS (
                SELECT 1 FROM user_achievements ua 
                WHERE ua.user_id = %s AND ua.achievement_id = a.id
            )
        ''', (total_exercises, user_id))
        
        new_achievements = []
        for row in cur.fetchall():
            cur.execute('''
                INSERT INTO user_achievements (user_id, achievement_id)
                VALUES (%s, %s)
            ''', (user_id, row[0]))
            new_achievements.append({'id': row[0], 'name': row[1]})
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'id': exercise_completion_id,
                'xp_earned': points,
                'total_xp': new_xp,
                'new_achievements': new_achievements
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
