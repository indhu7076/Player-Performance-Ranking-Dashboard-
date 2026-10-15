"""
Flask Application Backend using Pandas for Player Performance Ranking Dashboard
Includes User Authentication, Password Hashing, Session Management, and Role-Based Access.
"""

import os
import io
import json
import pandas as pd
from datetime import datetime
from functools import wraps
from flask import Flask, render_template, request, jsonify, Response, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from utils.ranking import calculate_player_rankings_df, DEFAULT_WEIGHTS
from utils.validation import validate_dataframe

app = Flask(__name__)
app.secret_key = 'sports-analytics-secret-auth-key-2026'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLAYERS_CSV_PATH = os.path.join(BASE_DIR, 'data', 'players.csv')
USERS_JSON_PATH = os.path.join(BASE_DIR, 'data', 'users.json')

# Global state
CURRENT_WEIGHTS = DEFAULT_WEIGHTS.copy()
PLAYERS_DF = pd.DataFrame()
USERS_LIST = []

def load_data():
    """Loads player statistics data into Pandas DataFrame."""
    global PLAYERS_DF
    if os.path.exists(PLAYERS_CSV_PATH):
        df_raw = pd.read_csv(PLAYERS_CSV_PATH)
        PLAYERS_DF, _, _ = validate_dataframe(df_raw)
    else:
        PLAYERS_DF = pd.DataFrame()

def save_data():
    """Saves memory DataFrame back to CSV."""
    if not PLAYERS_DF.empty:
        cols = ['Player ID', 'Player Name', 'Age', 'Team', 'Position', 'Matches', 'Goals', 'Assists', 'Passing', 'Defense', 'Fitness']
        save_df = PLAYERS_DF[cols].copy()
        save_df.to_csv(PLAYERS_CSV_PATH, index=False)

def load_users():
    """Loads registered user credentials from users.json."""
    global USERS_LIST
    if os.path.exists(USERS_JSON_PATH):
        with open(USERS_JSON_PATH, 'r', encoding='utf-8') as f:
            USERS_LIST = json.load(f)
    else:
        USERS_LIST = []

def save_users():
    """Saves registered users array to users.json."""
    with open(USERS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(USERS_LIST, f, indent=2)

# Load startup state
load_data()
load_users()

def get_ranked_players_df():
    """Helper to return ranked players dataframe."""
    return calculate_player_rankings_df(PLAYERS_DF, custom_weights=CURRENT_WEIGHTS)

def login_required(f):
    """Decorator to require user session for protected routes."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            if request.is_json or request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Authentication required. Please log in.'}), 401
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Context processor for templates
@app.context_processor
def inject_user():
    return dict(current_user=session.get('user'))

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        
        user = next((u for u in USERS_LIST if u['username'].lower() == username.lower()), None)
        
        if user and check_password_hash(user['password_hash'], password):
            session['user'] = {
                'username': user['username'],
                'email': user['email'],
                'role': user.get('role', 'Analyst')
            }
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', active_page='login', error='Invalid username or password.')
            
    return render_template('login.html', active_page='login')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        role = request.form.get('role', 'Analyst')
        
        if any(u['username'].lower() == username.lower() for u in USERS_LIST):
            return render_template('register.html', active_page='register', error='Username is already registered.')
            
        new_user = {
            'username': username,
            'email': email,
            'password_hash': generate_password_hash(password),
            'role': role,
            'created_at': datetime.utcnow().isoformat()
        }
        
        USERS_LIST.append(new_user)
        save_users()
        
        session['user'] = {
            'username': new_user['username'],
            'email': new_user['email'],
            'role': new_user['role']
        }
        return redirect(url_for('dashboard'))
        
    return render_template('register.html', active_page='register')

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))


# ==========================================
# PAGE ROUTING ENDPOINTS
# ==========================================

@app.route('/')
def home():
    return render_template('home.html', active_page='home')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html', active_page='dashboard')

@app.route('/rankings')
def rankings():
    return render_template('rankings.html', active_page='rankings')

@app.route('/player/<player_id>')
def player_profile(player_id):
    return render_template('player_profile.html', active_page='player_profile', player_id=player_id)

@app.route('/comparison')
def comparison():
    return render_template('comparison.html', active_page='comparison')

@app.route('/analytics')
def analytics():
    return render_template('analytics.html', active_page='analytics')

@app.route('/algorithm')
def algorithm():
    return render_template('algorithm.html', active_page='algorithm')

@app.route('/data_management')
@login_required
def data_management():
    return render_template('data_management.html', active_page='data_management')

@app.route('/about')
def about():
    return render_template('about.html', active_page='about')

@app.route('/settings')
def settings():
    return render_template('settings.html', active_page='settings')


# ==========================================
# REST API ENDPOINTS
# ==========================================

@app.route('/api/players', methods=['GET'])
def api_get_players():
    df_ranked = get_ranked_players_df()
    players_list = df_ranked.to_dict(orient='records')
    
    total_players = len(players_list)
    avg_score = round(df_ranked['Performance Score'].mean(), 1) if total_players > 0 else 0
    top_player = players_list[0]['Player Name'] if total_players > 0 else 'N/A'
    highest_score = players_list[0]['Performance Score'] if total_players > 0 else 0
    total_teams = df_ranked['Team'].nunique() if total_players > 0 else 0
    
    return jsonify({
        'success': True,
        'count': total_players,
        'summary': {
            'total_players': total_players,
            'avg_score': avg_score,
            'top_player': top_player,
            'highest_score': highest_score,
            'total_teams': total_teams
        },
        'weights': CURRENT_WEIGHTS,
        'players': players_list
    })

@app.route('/api/player/<player_id>', methods=['GET'])
def api_get_player_details(player_id):
    df_ranked = get_ranked_players_df()
    player_row = df_ranked[df_ranked['Player ID'] == player_id]
    
    if player_row.empty:
        return jsonify({'success': False, 'message': 'Player not found'}), 404
        
    target_player = player_row.to_dict(orient='records')[0]
    return jsonify({
        'success': True,
        'player': target_player
    })

@app.route('/api/algorithm/recalculate', methods=['POST'])
@login_required
def api_recalculate_algorithm():
    global CURRENT_WEIGHTS
    data = request.json or {}
    weights = data.get('weights', {})
    
    req_keys = ['goals', 'assists', 'passing', 'defense', 'fitness']
    for k in req_keys:
        if k in weights:
            CURRENT_WEIGHTS[k] = float(weights[k])
            
    df_ranked = get_ranked_players_df()
    return jsonify({
        'success': True,
        'message': 'Algorithm weights updated and rankings recalculated successfully.',
        'weights': CURRENT_WEIGHTS,
        'players': df_ranked.to_dict(orient='records')
    })

@app.route('/api/players/add', methods=['POST'])
@login_required
def api_add_player():
    global PLAYERS_DF
    data = request.json or {}
    
    new_row = {
        'Player ID': str(data.get('Player ID')).strip(),
        'Player Name': str(data.get('Player Name')).strip(),
        'Age': int(data.get('Age', 24)),
        'Team': str(data.get('Team')).strip(),
        'Position': str(data.get('Position')).strip(),
        'Matches': int(data.get('Matches', 0)),
        'Goals': float(data.get('Goals', 0)),
        'Assists': float(data.get('Assists', 0)),
        'Passing': float(data.get('Passing', 80)),
        'Defense': float(data.get('Defense', 50)),
        'Fitness': float(data.get('Fitness', 85))
    }
    
    if not PLAYERS_DF.empty and new_row['Player ID'] in PLAYERS_DF['Player ID'].values:
        return jsonify({'success': False, 'message': f"Player ID '{new_row['Player ID']}' already exists."}), 400
        
    temp_df = pd.concat([PLAYERS_DF, pd.DataFrame([new_row])], ignore_index=True)
    clean_df, errors, _ = validate_dataframe(temp_df)
    
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400
        
    PLAYERS_DF = clean_df
    save_data()
    
    df_ranked = get_ranked_players_df()
    return jsonify({
        'success': True,
        'message': f"Player '{new_row['Player Name']}' added successfully!",
        'players': df_ranked.to_dict(orient='records')
    })

@app.route('/api/players/edit/<player_id>', methods=['PUT'])
@login_required
def api_edit_player(player_id):
    global PLAYERS_DF
    data = request.json or {}
    
    if PLAYERS_DF.empty or player_id not in PLAYERS_DF['Player ID'].values:
        return jsonify({'success': False, 'message': 'Player not found'}), 404
        
    idx = PLAYERS_DF[PLAYERS_DF['Player ID'] == player_id].index[0]
    
    PLAYERS_DF.at[idx, 'Player Name'] = str(data.get('Player Name')).strip()
    PLAYERS_DF.at[idx, 'Age'] = int(data.get('Age'))
    PLAYERS_DF.at[idx, 'Team'] = str(data.get('Team')).strip()
    PLAYERS_DF.at[idx, 'Position'] = str(data.get('Position')).strip()
    PLAYERS_DF.at[idx, 'Matches'] = int(data.get('Matches'))
    PLAYERS_DF.at[idx, 'Goals'] = float(data.get('Goals'))
    PLAYERS_DF.at[idx, 'Assists'] = float(data.get('Assists'))
    PLAYERS_DF.at[idx, 'Passing'] = float(data.get('Passing'))
    PLAYERS_DF.at[idx, 'Defense'] = float(data.get('Defense'))
    PLAYERS_DF.at[idx, 'Fitness'] = float(data.get('Fitness'))
    
    save_data()
    df_ranked = get_ranked_players_df()
    return jsonify({
        'success': True,
        'message': f"Player '{data.get('Player Name')}' updated successfully!",
        'players': df_ranked.to_dict(orient='records')
    })

@app.route('/api/players/delete/<player_id>', methods=['DELETE'])
@login_required
def api_delete_player(player_id):
    global PLAYERS_DF
    if PLAYERS_DF.empty or player_id not in PLAYERS_DF['Player ID'].values:
        return jsonify({'success': False, 'message': 'Player not found'}), 404
        
    PLAYERS_DF = PLAYERS_DF[PLAYERS_DF['Player ID'] != player_id].copy()
    save_data()
    df_ranked = get_ranked_players_df()
    return jsonify({
        'success': True,
        'message': 'Player deleted successfully!',
        'players': df_ranked.to_dict(orient='records')
    })

@app.route('/api/data/import_csv', methods=['POST'])
@login_required
def api_import_csv():
    global PLAYERS_DF
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No CSV file attached.'}), 400
        
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'success': False, 'message': 'Please upload a valid .csv file.'}), 400
        
    try:
        df_uploaded = pd.read_csv(file.stream)
        clean_df, errors, summary_stats = validate_dataframe(df_uploaded)
        
        if errors and len(clean_df) == 0:
            return jsonify({
                'success': False,
                'message': 'CSV validation failed with critical errors.',
                'errors': errors,
                'summary': summary_stats
            }), 400
            
        PLAYERS_DF = clean_df
        save_data()
        df_ranked = get_ranked_players_df()
        
        return jsonify({
            'success': True,
            'message': f"Successfully imported dataset! {summary_stats['valid_records']} valid records loaded.",
            'summary': summary_stats,
            'warnings': errors,
            'players': df_ranked.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error reading CSV file: {str(e)}'}), 500

@app.route('/api/data/export_csv', methods=['GET'])
def api_export_csv():
    df_ranked = get_ranked_players_df()
    output = io.StringIO()
    
    cols = ['Rank', 'Player ID', 'Player Name', 'Team', 'Position', 'Matches', 'Goals', 'Assists', 'Passing', 'Defense', 'Fitness', 'Performance Score', 'Performance Level']
    export_df = df_ranked[cols].copy()
    export_df.to_csv(output, index=False)
    
    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=player_performance_rankings.csv"}
    )

@app.route('/api/demo/reset', methods=['POST'])
def api_demo_reset():
    global CURRENT_WEIGHTS
    CURRENT_WEIGHTS = DEFAULT_WEIGHTS.copy()
    load_data()
    df_ranked = get_ranked_players_df()
    return jsonify({
        'success': True,
        'message': 'Demo dataset and algorithm weights reset successfully!',
        'players': df_ranked.to_dict(orient='records')
    })

if __name__ == '__main__':
    print("Starting Player Performance Ranking Dashboard Flask Server with Auth...")
    app.run(debug=True, host='127.0.0.1', port=5000)
