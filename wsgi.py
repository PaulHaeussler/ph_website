from main import Website

def build(dbuser, dbpw, dbhost, dbschema):
    w = Website(dbuser, dbpw, dbhost, dbschema)
    w.create_app()
    return w.app


