import json
import os
import psycopg2
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для прогресса и достижений пользователя
    POST / - отметить урок как завершенный с разблокировкой достижений
    GET /?user_id=1 - получить прогресс пользователя
    GET /?user_id=1&action=achievements - получить достижения
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
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        user_id = body_data.get('user_id')
        lesson_id = body_data.get('lesson_id')
        rating = body_data.get('rating')
        
        if not user_id or not lesson_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id and lesson_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            INSERT INTO user_progress (user_id, lesson_id, completed, completed_at, rating)
            VALUES (%s, %s, true, %s, %s)
            ON CONFLICT (user_id, lesson_id) 
            DO UPDATE SET completed = true, completed_at = %s, rating = %s
            RETURNING id
        ''', (user_id, lesson_id, datetime.now(), rating, datetime.now(), rating))
        
        progress_id = cur.fetchone()[0]
        
        cur.execute('''
            UPDATE users
            SET total_xp = total_xp + 100
            WHERE id = %s
        ''', (user_id,))
        
        conn.commit()
        
        cur.execute('''
            SELECT COUNT(*) FROM user_progress WHERE user_id = %s AND completed = true
        ''', (user_id,))
        completed_lessons = cur.fetchone()[0]
        
        cur.execute('''
            SELECT a.id, a.name, a.requirement_type, a.requirement_value
            FROM achievements a
            WHERE NOT EXISTS (
                SELECT 1 FROM user_achievements ua 
                WHERE ua.user_id = %s AND ua.achievement_id = a.id
            )
        ''', (user_id,))
        
        pending_achievements = cur.fetchall()
        new_achievements = []
        
        for ach in pending_achievements:
            ach_id, ach_name, req_type, req_value = ach
            should_unlock = False
            
            if req_type == 'lessons_completed' and completed_lessons >= req_value:
                should_unlock = True
            elif req_type == 'specific_lesson' and lesson_id == req_value:
                should_unlock = True
            
            if should_unlock:
                cur.execute('''
                    INSERT INTO user_achievements (user_id, achievement_id)
                    VALUES (%s, %s)
                ''', (user_id, ach_id))
                new_achievements.append({'id': ach_id, 'name': ach_name})
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({
                'id': progress_id,
                'xp_earned': 100,
                'new_achievements': new_achievements
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        action = params.get('action')
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id required'}),
                'isBase64Encoded': False
            }
        
        if action == 'achievements':
            cur.execute('''
                SELECT a.id, a.name, a.description, a.icon, a.requirement_type, a.requirement_value,
                       CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as unlocked,
                       ua.unlocked_at
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = %s
                ORDER BY a.id
            ''', (user_id,))
            
            rows = cur.fetchall()
            achievements = []
            
            for row in rows:
                achievements.append({
                    'id': row[0],
                    'name': row[1],
                    'description': row[2],
                    'icon': row[3],
                    'requirement_type': row[4],
                    'requirement_value': row[5],
                    'unlocked': row[6],
                    'unlocked_at': row[7].isoformat() if row[7] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps(achievements, ensure_ascii=False),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            SELECT lesson_id, completed, completed_at, rating
            FROM user_progress
            WHERE user_id = %s
        ''', (user_id,))
        
        rows = cur.fetchall()
        progress = []
        
        for row in rows:
            progress.append({
                'lesson_id': row[0],
                'completed': row[1],
                'completed_at': row[2].isoformat() if row[2] else None,
                'rating': row[3]
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(progress, ensure_ascii=False),
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