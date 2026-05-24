import sqlite3, uuid
conn=sqlite3.connect('db.sqlite3')
cur=conn.cursor()
cur.execute("SELECT id FROM users_user WHERE email=''")
rows=cur.fetchall()
for r in rows:
    cur.execute("UPDATE users_user SET email=? WHERE id=?", (f"temp_{uuid.uuid4().hex[:8]}@example.com", r[0]))
conn.commit()
conn.close()
