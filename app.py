import os
import MySQLdb
from flask import Flask, jsonify
from flask import request
from flask import session, g, redirect, url_for, abort, render_template, flash
from subprocess import call
from base64 import decodestring
import sys
#import tesseract
from tightocr.adapters.api_adapter import TessApi
from tightocr.adapters.lept_adapter import pix_read
try:
    # this is how you would normally import
    from flask.ext.cors import cross_origin
except:
    # support local usage without installed package
    from flask_cors import cross_origin

app = Flask(__name__)

#sample request:
#http://0.0.0.0:5000/ocr?swt=1&img=http://bit.ly/ocrimage


# Database
db = MySQLdb.connect(host="127.0.0.1", port=9990, user="root", passwd=os.environ["DBPASS"],
db="ocr")
cursor = db.cursor()

@app.route('/')
@cross_origin() # allow all origins all methods.
def show_entries():
	return render_template('/index.html')
@app.route('/ocr', methods = ['POST'])
def ocr():
	request_data = request.get_json(force=True)
	img = request_data['img']
	# Font name
	font = request_data['font']
	#font = "eng"
	# Whitelist
	wl = request_data['wl']
	#wl = "+-,.E0123456789"
	if img == None:
		return "No image!"
	try:
		with open("tmp.png","wb") as f:
			f.write(decodestring(img))
			f.close()
		t = TessApi(None, str(font));
		t.set_variable('tessedit_char_whitelist', str(wl))
		# Stroke Width Transform
		if request_data['swt'] == 1:
			call(["DetectText","tmp.png","tmp.png","1"])
		mImgFileOut = "tmp.png"
		p = pix_read(mImgFileOut)
		t.set_image_pix(p)
		t.recognize()
		result = str(t.get_utf8_text())
		try:
			test = float(result)
			# execute SQL select statement
			sql = """INSERT INTO `experiment`(`name`, `readout`) VALUES ("{}",{})""".format("teste", float(result))
			cursor.execute(sql)
			# commit your changes
			db.commit()
		except Exception, e:
			pass
		#t.End()
		#call(["rm","tmp.png","tmp_pp.png"])
		return result
	except:
		print "Unexpected error:", sys.exc_info()[0]
		result = "Error."
		pass
	print result
	return result
if __name__ == "__main__":
	app.debug = True
	app.run('0.0.0.0')
