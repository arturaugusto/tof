FROM ubuntu:14.04

RUN apt-get -q -y update

RUN mkdir -p /opt
RUN mkdir -p /usr/local/share/tessdata/


RUN apt-get -q -y install wget
RUN apt-get -q -y install unzip
RUN apt-get -q -y install tar
RUN apt-get -q -y install gzip
RUN apt-get -q -y install git

# Get trained data

RUN cd /opt && wget http://tesseract-ocr.googlecode.com/files/tesseract-ocr-3.02.eng.tar.gz
RUN cd /opt && tar -zxvf tesseract-ocr-3.02.eng.tar.gz
RUN cp -R /opt/tesseract-ocr/tessdata/* /usr/local/share/tessdata/

# letsgodigital

RUN cd /opt && git clone https://github.com/arturaugusto/display_ocr.git
RUN cp -R /opt/display_ocr/letsgodigital/* /usr/local/share/tessdata/

# install build deps

RUN apt-get -q -y install gcc
RUN apt-get -q -y install make
RUN apt-get -q -y install cmake
RUN apt-get -q -y install build-essential

# Tesseract
RUN apt-get -q -y install libleptonica-dev
#RUN apt-get -q -y install libtesseract3 libtesseract-dev
#RUN apt-get -q -y install tesseract-ocr-eng

RUN apt-get -q -y install autoconf automake libtool
RUN apt-get -q -y install libpng12-dev
RUN apt-get -q -y install libjpeg62-dev
RUN apt-get -q -y install libtiff4-dev
RUN apt-get -q -y install zlib1g-dev

RUN cd /opt && wget http://tesseract-ocr.googlecode.com/files/tesseract-ocr-3.02.02.tar.gz
RUN cd /opt && tar -zxvf tesseract-ocr-3.02.02.tar.gz
RUN cd /opt/tesseract-ocr && ./autogen.sh
RUN cd /opt/tesseract-ocr && ./configure
RUN cd /opt/tesseract-ocr && make
RUN cd /opt/tesseract-ocr && make install
RUN cd /opt/tesseract-ocr && ldconfig


# CTesseract

RUN cd /opt && git clone https://github.com/dsoprea/CTesseract.git
RUN mkdir /opt/CTesseract/build
RUN cd /opt/CTesseract/build && cmake .. && make && make install

# Copy to other local, dont know if its necessary

RUN cp /opt/CTesseract/build/lib* /usr/lib/

# Tess data

# In theory, should be able to set export TESSDATA_PREFIX=/usr/share/tesseract-ocr/, 
# but when I tried I still got error: Error opening data file /usr/local/share/tessdata/eng.traineddata
# Workaround: just copy the data to where it expects
#RUN mkdir -p /usr/local/share/tessdata/
#RUN cp -R /usr/share/tesseract-ocr/tessdata/* /usr/local/share/tessdata/

# mysql
RUN apt-get install -y mysql-client
RUN apt-get install -y python-mysqldb

# Install Python Setuptools
RUN apt-get install -y python-setuptools

# Install pip
RUN easy_install pip

# Install requirements.txt
ADD requirements.txt /src/requirements.txt
RUN cd /src; pip install -r requirements.txt


# stroke width transform

RUN apt-get -q -y install libopencv-core2.4
RUN apt-get -q -y install libopencv-core-dev
RUN apt-get -q -y install libboost1.55-all-dev
RUN apt-get -q -y install libopencv-flann2.4 libopencv-flann-dev
RUN apt-get -q -y install libopencv-imgproc2.4 libopencv-imgproc-dev
RUN apt-get -q -y install libopencv-photo2.4 libopencv-photo-dev
RUN apt-get -q -y install libopencv-video2.4 libopencv-video-dev
RUN apt-get -q -y install libopencv-features2d2.4 libopencv-features2d-dev
RUN apt-get -q -y install libopencv-objdetect2.4 libopencv-objdetect-dev
RUN apt-get -q -y install libopencv-calib3d2.4 libopencv-calib3d-dev
RUN apt-get -q -y install libopencv-ml2.4 libopencv-ml-dev
RUN apt-get -q -y install libopencv-contrib2.4 libopencv-contrib-dev
RUN apt-get -q -y install libopencv-highgui2.4 libopencv-highgui-dev


RUN apt-get -q -y install git


RUN cd /opt && git clone https://github.com/tleyden/DetectText.git
RUN cd /opt/DetectText && g++ -o DetectText TextDetection.cpp FeaturesMain.cpp -lopencv_core -lopencv_highgui -lopencv_imgproc -I/opt/DetectText

RUN cd /opt/DetectText && cp DetectText /usr/local/bin



# Add the Flask App

ADD . /src

# EXPOSE PORT
EXPOSE 5000

# Run the Flask APP
CMD python src/app.py
