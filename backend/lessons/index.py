import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с уроками рисования
    GET / - получить все уроки
    GET /?id=1 - получить урок по ID
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    params = event.get('queryStringParameters', {}) or {}
    lesson_id = params.get('id')
    
    if lesson_id:
        cur.execute('''
            SELECT id, title, description, content, duration, difficulty, icon, order_index
            FROM lessons
            WHERE id = %s
        ''', (lesson_id,))
        row = cur.fetchone()
        
        if row:
            lesson = {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'content': row[3],
                'duration': row[4],
                'difficulty': row[5],
                'icon': row[6],
                'order_index': row[7]
            }
            result = lesson
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Lesson not found'}),
                'isBase64Encoded': False
            }
    else:
        cur.execute('''
            SELECT id, title, description, content, duration, difficulty, icon, order_index
            FROM lessons
            ORDER BY order_index
        ''')
        rows = cur.fetchall()
        
        lessons = []
        for row in rows:
            lessons.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'content': row[3],
                'duration': row[4],
                'difficulty': row[5],
                'icon': row[6],
                'order_index': row[7]
            })
        result = lessons
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False),
        'isBase64Encoded': False
    }
