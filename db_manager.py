import pymysql

class DBManager:
    conn = None
    curs = None

    @staticmethod
    def initialize(host, port, user, password, db, charset='utf-8', autocommit=True):
        DBManager.conn = pymysql.connect(host=host, port=port, user=user, password=password,
                               db=db, charset=charset, autocommit=True)
        DBManager.curs = DBManager.conn.cursor(pymysql.cursors.DictCursor)


    @staticmethod
    def executeQuery(selectQuery):
        if DBManager.conn == None or DBManager.curs == None:
            return []
        try:
            DBManager.curs.execute(selectQuery)
            result = DBManager.curs.fetchall()
            return result
        except:
            return []

