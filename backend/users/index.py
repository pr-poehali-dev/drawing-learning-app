import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с пользователями
    POST / - создать нового пользователя
    GET /?id=1 - получить данные пользователя
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        username = body_data.get('username')
        email = body_data.get('email')
        
        if not username or not email:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'username and email required'}),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            INSERT INTO users (username, email)
            VALUES (%s, %s)
            RETURNING id, username, email, level, total_xp
        ''', (username, email))
        
        row = cur.fetchone()
        conn.commit()
        
        user = {
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'level': row[3],
            'total_xp': row[4]
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(user, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('id')
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            SELECT u.id, u.username, u.email, u.level, u.total_xp, u.avatar_url,
                   COUNT(DISTINCT up.lesson_id) as completed_lessons,
                   COUNT(DISTINCT ue.exercise_id) as completed_exercises
            FROM users u
            LEFT JOIN user_progress up ON u.id = up.user_id AND up.completed = true
            LEFT JOIN user_exercises ue ON u.id = ue.user_id
            WHERE u.id = %s
            GROUP BY u.id
        ''', (user_id,))
        
        row = cur.fetchone()
        
        if not row:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        user = {
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'level': row[3],
            'total_xp': row[4],
            'avatar_url': row[5],
            'completed_lessons': row[6],
            'completed_exercises': row[7]
        }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(user, ensure_ascii=False),
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
