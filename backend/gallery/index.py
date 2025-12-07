import json
import os
import base64
import psycopg2
import boto3
from datetime import datetime
from typing import Dict, Any

s3 = boto3.client('s3',
    endpoint_url='https://bucket.poehali.dev',
    aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с галереей работ
    GET / - получить все работы
    POST / - загрузить новую работу (base64)
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
            SELECT g.id, g.user_id, u.username, u.level, g.title, g.description, 
                   g.image_url, g.likes_count, g.comments_count, g.created_at
            FROM gallery g
            JOIN users u ON g.user_id = u.id
            ORDER BY g.created_at DESC
            LIMIT 50
        ''')
        rows = cur.fetchall()
        
        gallery = []
        for row in rows:
            gallery.append({
                'id': row[0],
                'user_id': row[1],
                'author': row[2],
                'level': row[3],
                'title': row[4],
                'description': row[5],
                'image_url': row[6],
                'likes': row[7],
                'comments': row[8],
                'created_at': row[9].isoformat() if row[9] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(gallery, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        user_id = body_data.get('user_id')
        title = body_data.get('title', 'Без названия')
        description = body_data.get('description', '')
        image_base64 = body_data.get('image')
        
        if not user_id or not image_base64:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'user_id and image required'}),
                'isBase64Encoded': False
            }
        
        image_data = base64.b64decode(image_base64)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'gallery/{user_id}_{timestamp}.png'
        
        s3.put_object(
            Bucket='files',
            Key=filename,
            Body=image_data,
            ContentType='image/png'
        )
        
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"
        
        cur.execute('''
            INSERT INTO gallery (user_id, title, description, image_url)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        ''', (user_id, title, description, cdn_url))
        
        gallery_id = cur.fetchone()[0]
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'id': gallery_id, 'image_url': cdn_url}),
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
