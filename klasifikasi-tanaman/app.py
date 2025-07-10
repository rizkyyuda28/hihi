from flask import Flask, render_template, request, redirect, url_for, session
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import sqlite3

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Database setup
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Dictionary lengkap dengan informasi klasifikasi
dic = {
    0: {
        'nama': 'Corn (maize) Cercospora leaf spot Gray leaf_spot',
        'penyebab': 'Cercospora zeae-maydis (jamur)',
        'gejala': 'Bercak kecil berwarna abu-abu pada daun, berkembang menjadi lesi besar.',
        'penanggulangan': 'Gunakan varietas tahan penyakit, rotasi tanaman, dan fungisida berbasis strobilurin.'
    },
    1: {
        'nama': 'Corn (maize) Common_rust_',
        'penyebab': 'Puccinia sorghi (jamur)',
        'gejala': 'Pustula cokelat kemerahan pada daun.',
        'penanggulangan': 'Gunakan varietas tahan, sanitasi lahan, dan fungisida seperti mancozeb.'
    },
    2: {
        'nama': 'Corn_(maize) Northern Leaf Blight',
        'penyebab': 'Exserohilum turcicum (jamur)',
        'gejala': 'Lesi cokelat berbentuk elips pada daun.',
        'penanggulangan': 'Gunakan varietas tahan, rotasi tanaman, dan aplikasi fungisida.'
    },
    3: {
        'nama': 'Corn (maize) healthy',
        'penyebab': 'Tidak ada penyakit.',
        'gejala': 'Tanaman sehat tanpa gejala penyakit.',
        'penanggulangan': 'Tidak perlu tindakan.'
    },
    4: {
        'nama': 'Potato Early blight',
        'penyebab': 'Alternaria solani (jamur)',
        'gejala': 'Bercak cokelat berbentuk melingkar pada daun yang tua.',
        'penanggulangan': 'Gunakan fungisida berbasis tembaga dan rotasi tanaman.'
    },
    5: {
        'nama': 'Potato Late blight',
        'penyebab': 'Phytophthora infestans (jamur air)',
        'gejala': 'Lesi cokelat pada daun dan batang dengan tepi kekuningan.',
        'penanggulangan': 'Gunakan fungisida berbasis metalaksil dan sanitasi lahan.'
    },
    6: {
        'nama': 'Potato healthy',
        'penyebab': 'Tidak ada penyakit.',
        'gejala': 'Tanaman sehat tanpa gejala penyakit.',
        'penanggulangan': 'Tidak perlu tindakan.'
    },
    7: {
        'nama': 'Tomato Bacterial_spot',
        'penyebab': 'Xanthomonas campestris pv. vesicatoria (bakteri)',
        'gejala': 'Bercak kecil berair yang berkembang menjadi cokelat pada daun dan buah.',
        'penanggulangan': 'Gunakan benih bebas penyakit dan fungisida berbasis tembaga.'
    },
    8: {
        'nama': 'Tomato Early blight',
        'penyebab': 'Alternaria solani (jamur)',
        'gejala': 'Bercak melingkar konsentris pada daun yang lebih tua.',
        'penanggulangan': 'Gunakan fungisida berbasis tembaga dan sanitasi lahan.'
    },
    9: {
        'nama': 'Tomato Late blight',
        'penyebab': 'Phytophthora infestans (jamur air)',
        'gejala': 'Lesi hitam pada daun, batang, dan buah dengan tepi kekuningan.',
        'penanggulangan': 'Gunakan fungisida berbasis tembaga atau metalaksil, dan sanitasi.'
    },
    10: {
        'nama': 'Tomato Leaf Mold',
        'penyebab': 'Cladosporium fulvum (jamur)',
        'gejala': 'Bercak hijau kekuningan pada permukaan atas daun dengan jamur abu-abu di bawahnya.',
        'penanggulangan': 'Gunakan varietas tahan, perbaiki ventilasi, dan gunakan fungisida.'
    },
    11: {
        'nama': 'Tomato Septoria leaf spot',
        'penyebab': 'Septoria lycopersici (jamur)',
        'gejala': 'Bercak kecil dengan pusat kelabu dan tepi cokelat pada daun bawah.',
        'penanggulangan': 'Gunakan fungisida berbasis tembaga dan rotasi tanaman.'
    },
    12: {
        'nama': 'Tomato Spider mites Two spotted spider mite',
        'penyebab': 'Tetranychus urticae (hama)',
        'gejala': 'Daun tampak berbintik kuning dan akhirnya kering.',
        'penanggulangan': 'Gunakan pestisida atau predator alami seperti kumbang predator.'
    },
    13: {
        'nama': 'Tomato Target Spot',
        'penyebab': 'Corynespora cassiicola (jamur)',
        'gejala': 'Bercak cokelat dengan tepi kuning pada daun dan buah.',
        'penanggulangan': 'Gunakan fungisida berbasis strobilurin dan rotasi tanaman.'
    },
    14: {
        'nama': 'Tomato Yellow Leaf_Curl Virus',
        'penyebab': 'Begomovirus (virus)',
        'gejala': 'Daun menggulung, menguning, dan tanaman kerdil.',
        'penanggulangan': 'Gunakan varietas tahan dan pengendalian vektor kutu kebul.'
    },
    15: {
        'nama': 'Tomato mosaic virus',
        'penyebab': 'Tobamovirus (virus)',
        'gejala': 'Daun berwarna hijau gelap dengan pola mozaik.',
        'penanggulangan': 'Hancurkan tanaman terinfeksi dan gunakan benih bebas penyakit.'
    },
    16: {
        'nama': 'Tomato healthy',
        'penyebab': 'Tidak ada penyakit.',
        'gejala': 'Tanaman sehat tanpa gejala penyakit.',
        'penanggulangan': 'Tidak perlu tindakan.'
    }
}


# Load model
model = load_model('./model/massive_16-massive_16-86.12.h5')

def predict_label(img_path):
    """Melakukan prediksi terhadap gambar yang diunggah."""
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    prediction = model.predict(img_array)
    index = np.argmax(prediction)
    return dic[index]

# Routes
@app.route("/", methods=['GET'])
def main():
    """Serve the modern frontend homepage."""
    return redirect(url_for('frontend_home'))

@app.route("/frontend", methods=['GET'])
def frontend_home():
    """Serve the modern frontend HTML."""
    return app.send_static_file('../frontend/public/index.html')

@app.route("/login", methods=['GET', 'POST'])
def login():
    """Halaman login."""
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # Implementasi autentikasi sederhana
        if username == 'admin' and password == 'password':
            session['username'] = username
            return redirect(url_for('home'))
        else:
            return render_template("login.html", error="Kredensial tidak valid")
    return render_template("login.html")

@app.route("/signup", methods=['GET', 'POST'])
def signup():
    """Halaman pendaftaran."""
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", (name, email, password))
            conn.commit()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            return render_template("signup.html", error="Email sudah terdaftar.")
        finally:
            conn.close()
    return render_template("signup.html")

@app.route("/home", methods=['GET'])
def home():
    """Halaman utama setelah login."""
    if 'username' in session:
        return render_template("home.html")
    else:
        return redirect(url_for('login'))

@app.route("/classification", methods=['GET', 'POST'])
def classification():
    """Halaman klasifikasi."""
    if 'username' in session:
        return render_template("classification.html")
    else:
        return redirect(url_for('login'))

@app.route("/submit", methods=['POST'])
def get_output():
    """Proses file yang diunggah dan tampilkan hasil prediksi."""
    if 'username' in session:
        if request.method == 'POST':
            img = request.files['my_image']

            if img and img.filename != '':
                img_path = os.path.join('static', img.filename)
                img.save(img_path)

                prediction = predict_label(img_path)

                # Format hasil prediksi untuk ditampilkan
                result = f"""
                <b>Nama</b>: {prediction['nama']}<br>
                <b>Penyebab</b>: {prediction['penyebab']}<br>
                <b>Gejala</b>: {prediction['gejala']}<br>
                <b>Penanggulangan</b>: {prediction['penanggulangan']}
                """
                
                return render_template("classification.html", prediction=result, img_path=img_path)
            else:
                return render_template("classification.html", prediction="Tidak ada file yang diunggah.", img_path=None)
    else:
        return redirect(url_for('login'))

@app.route("/logout")
def logout():
    """Logout user."""
    session.pop('username', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
