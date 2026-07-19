# ============================================================================
# RAILWAY SERVER.PY - HIGH PERFORMANCE EDITION (new server for testing only)
# PSL Translator - Final Year Project
#
# Logic: Video Upload -> Fast Processing -> Keyword Matching -> Correct Sentence
# ============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import mediapipe as mp
from tensorflow import keras
import json
import os
import tempfile
from collections import deque
import re

app = Flask(__name__)
CORS(app) 

# ============================================================================
# 🧠 EXPANDED KNOWLEDGE BASE (155 Sentences - Daily & Work Life)
# Strictly uses your 31 predefined words.
# ============================================================================
VALID_SENTENCES = [
    # --- Meetings & Time ---
    "We meet this time.", "Meet this time now.", "I work this time.", "Make project plan time.",
    "Team meet work time.", "We meet this day.", "Team meet this day.", "Work this day now.",
    "Write this word day.", "You work this day.", "I meet boss now.", "We meet boss now.",
    "You meet client now.", "Team meet client now.", "Female team meet now.", "Boss meet female client.",
    "I meet male client.", "We meet this male.", "Team meet this female.", "I meet you this day.",
    "You meet me this time.", "Boss meet team this day.", "Client meet boss this time.",
    
    # --- Communication (Call/Talk/Message/Word) ---
    "I call this client.", "Boss call male client.", "I call office team.", "We call this boss.",
    "You call this client.", "Team call boss now.", "I call you now.", "You call female team.",
    "Talk this project word.", "Male team talk work.", "You talk this idea.", "I talk project plan.",
    "Talk this job now.", "We talk this plan.", "Team talk this idea.", "Boss talk this word.",
    "I talk this time.", "You talk this day.", "Give client this message.", "We send office message.",
    "You send this message.", "I send mine message.", "Boss send this message.", "Team read this message.",
    "I read this message.", "Client read this message.", "Give boss this word.", "I make this word.",
    "You write this word.", "We read this word.", "I give you this word.", "Boss give team word.",

    # --- Task Execution & Work (Make/Write/Read/Work/Job) ---
    "Team make office work.", "Help make this project.", "We make this plan.", "You make this job.",
    "I make job report.", "Team make this report.", "We make this idea.", "Boss make this plan.",
    "I write this plan.", "We write office plan.", "Write this work report.", "Help write this report.",
    "You write this project.", "Team write this message.", "I write mine report.", "Boss write this job.",
    "Read this job report.", "Team read this plan.", "You read mine report.", "Boss read this project.",
    "Client read this plan.", "I read office report.", "We read this job.", "You read this office work.",
    "Male team talk work.", "I give team work.", "This work is mine.", "Team do this work.",
    "Boss give team job.", "You make this job.", "I work this job.", "Team work this job.",
    "We help this job.", "This job is mine.", "I help this work.", "You help this project.",

    # --- Project Management (Project/Report/Plan/Idea) ---
    "Boss send project report.", "I send project word.", "Send client project idea.", "This project is mine.",
    "Team make this project.", "We help this project.", "You read this project.", "I give this project.",
    "I send mine report.", "You send mine report.", "We send report day.", "Client read this report.",
    "Boss read mine report.", "Team write mine report.", "I make this report.", "You give this report.",
    "We make this plan.", "Team read this plan.", "I write this plan.", "Boss make this plan.",
    "You send this plan.", "Client read this plan.", "We send this plan.", "I give this plan.",
    "I give you idea.", "Give male this idea.", "We give client idea.", "You talk this idea.",
    "I give mine idea.", "Boss give this idea.", "Team make this idea.", "You send this idea.",

    # --- Giving & Helping ---
    "I give team work.", "Boss give team job.", "Give client this message.", "Give boss this word.",
    "We give client idea.", "Give male this idea.", "I give mine idea.", "You give me this job.",
    "Team give boss report.", "Client give this project.", "Help make this project.", "Help write this report.",
    "You help female team.", "I help this team.", "We help this client.", "Boss help this team.",
    "Team help this boss.", "You help this work.", "I help this day.", "We help this time.",

    # --- Office & Sending ---
    "We write office plan.", "We send office message.", "I call office team.", "Team make office work.",
    "Boss send this office.", "I work this office.", "You meet this office.", "We help this office.",
    "Boss send project report.", "I send project word.", "Send client project idea.", "We send office message.",
    "You send mine report.", "We send report day.", "I send mine message.", "Team send this project.",
    "Client send this plan.", "I send this idea.", "Boss send this work.", "You send this job.",
    
    # --- Assertions (Mine/This) ---
    "This work is mine.", "This project is mine.", "This report is mine.", "This plan is mine.",
    "This idea is mine.", "This job is mine.", "This office is mine.", "This message is mine."
]

# ============================================================================
# CONFIG
# ============================================================================
MODEL_PATH = "psl_model_v3.h5"
CLASS_FILE = "class_names_v3.json"
SEQUENCE_LENGTH = 30
CONFIDENCE_THRESHOLD = 0.70

# ============================================================================
# LOAD AI ENGINE
# ============================================================================
model = keras.models.load_model(MODEL_PATH)
with open(CLASS_FILE, "r") as f:
    class_names = json.load(f)

mp_holistic = mp.solutions.holistic

# ============================================================================
# 🧠 SMART MATCHING ALGORITHM (100% UNTOUCHED)
# ============================================================================
def get_best_sentence_match(raw_predicted_words):
    if not raw_predicted_words: return ""
    predicted_set = set([w.lower().strip() for w in raw_predicted_words])
    
    best_score = 0
    best_sentence = ""

    for sentence in VALID_SENTENCES:
        clean_target = re.sub(r'[^\w\s]', '', sentence).lower()
        target_words = set(clean_target.split())
        overlap_count = len(predicted_set.intersection(target_words))
        
        if overlap_count > best_score:
            best_score = overlap_count
            best_sentence = sentence
            
    if best_score > 0:
        print(f"✅ Smart Match: Raw='{predicted_set}' -> Matched='{best_sentence}' (Score: {best_score})")
        return best_sentence
    else:
        raw_sentence = " ".join(raw_predicted_words)
        print(f"⚠️ No Match Found. Returning raw: {raw_sentence}")
        return raw_sentence

# ============================================================================
# FEATURE EXTRACTION (100% UNTOUCHED)
# ============================================================================
def extract_features(results):
    if results.pose_landmarks:
        res = results.pose_landmarks.landmark
        upper_body = np.array([
            [res[11].x, res[11].y, res[11].z], [res[12].x, res[12].y, res[12].z],
            [res[13].x, res[13].y, res[13].z], [res[14].x, res[14].y, res[14].z],
            [res[15].x, res[15].y, res[15].z], [res[16].x, res[16].y, res[16].z],
        ]).flatten()
        anchors = np.array([
            [res[11].x, res[11].y, res[11].z], [res[12].x, res[12].y, res[12].z],
            [res[23].x, res[23].y, res[23].z], [res[24].x, res[24].y, res[24].z],
        ])
    else:
        upper_body = np.zeros(18)
        anchors = np.zeros((4, 3))

    lh = (np.array([[p.x, p.y, p.z] for p in results.left_hand_landmarks.landmark]).flatten() 
          if results.left_hand_landmarks else np.zeros(63))
    rh = (np.array([[p.x, p.y, p.z] for p in results.right_hand_landmarks.landmark]).flatten() 
          if results.right_hand_landmarks else np.zeros(63))
    return upper_body, lh, rh, anchors

def normalize_frame(pose, lh, rh, anchors):
    l_sh, r_sh = anchors[0], anchors[1]
    if np.sum(l_sh) == 0 or np.sum(r_sh) == 0: return None
    center = (l_sh + r_sh) / 2
    mid_shoulder = (l_sh + r_sh) / 2
    l_hip, r_hip = anchors[2], anchors[3]
    if np.sum(l_hip) != 0 and np.sum(r_hip) != 0:
        mid_hip = (l_hip + r_hip) / 2
        scale = np.linalg.norm(mid_shoulder - mid_hip)
    else:
        scale = np.linalg.norm(l_sh - r_sh) * 1.5
    if scale < 0.1: scale = 1
    def norm(data):
        if len(data) == 0: return data
        reshaped = data.reshape(-1, 3)
        mask = np.any(reshaped != 0, axis=1)
        reshaped[mask] = (reshaped[mask] - center) / scale
        return reshaped.flatten()
    return np.concatenate([norm(pose), norm(lh), norm(rh)])

# ============================================================================
# VIDEO PROCESSING (HIGHLY OPTIMIZED)
# ============================================================================
def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return ""

    holistic = mp_holistic.Holistic(static_image_mode=False, min_detection_confidence=0.5, min_tracking_confidence=0.5)
    frame_buffer = deque(maxlen=SEQUENCE_LENGTH)
    prediction_history = []
    
    frame_count = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        frame_count += 1
        
        # SPEED HACK 1: Skip every 2nd frame. Preserves logic, cuts MediaPipe time by 50%.
        if frame_count % 2 == 0:
            continue
            
        # SPEED HACK 2: Instantly downscale massive mobile video to standard webcam resolution.
        frame = cv2.resize(frame, (640, 480))
        
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = holistic.process(rgb)
        
        hands_visible = (results.left_hand_landmarks or results.right_hand_landmarks)
        p, l, r, a = extract_features(results)
        norm = normalize_frame(p, l, r, a)
        
        if norm is not None: frame_buffer.append(norm)
        else: frame_buffer.append(np.zeros(144))
        
        if len(frame_buffer) == SEQUENCE_LENGTH and hands_visible:
            sequence = np.array(list(frame_buffer))
            inp = np.expand_dims(sequence, axis=0)
            
            # SPEED HACK 3: Tensor execution instead of .predict(). Eliminates batching overhead.
            probs = model(inp, training=False)[0].numpy()
            
            idx = np.argmax(probs)
            conf = float(probs[idx])
            pred = class_names[idx]
            
            if pred != "_idle_" and conf >= CONFIDENCE_THRESHOLD:
                prediction_history.append(pred)

    cap.release()
    holistic.close()

    if not prediction_history: return ""

    unique_words = []
    last_word = ""
    for pred in prediction_history:
        if pred != last_word:
            unique_words.append(pred)
            last_word = pred

    final_sentence = get_best_sentence_match(unique_words)
    return final_sentence

# ============================================================================
# API ENDPOINTS
# ============================================================================
@app.route("/predict_sentence", methods=["POST"])
def predict_sentence():
    if "video" not in request.files:
        return jsonify({"error": "No video file received"}), 400

    video_file = request.files["video"]
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, "received_video.mp4")
    video_file.save(temp_path)

    sentence = process_video(temp_path)

    try:
        os.remove(temp_path)
        os.rmdir(temp_dir)
    except: pass

    if sentence:
        return jsonify({"sentence": sentence})
    else:
        return jsonify({"sentence": "", "error": "No signs detected"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)