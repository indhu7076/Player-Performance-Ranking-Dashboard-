"""
Data Validation Engine using Pandas for Player Performance Ranking Dashboard
Validates dataset integrity, checks for missing values, invalid numbers, and duplicates.
"""

import pandas as pd

REQUIRED_COLUMNS = [
    'Player ID', 'Player Name', 'Age', 'Team', 'Position',
    'Matches', 'Goals', 'Assists', 'Passing', 'Defense', 'Fitness'
]

def validate_dataframe(df):
    """
    Validates a pandas DataFrame against expected schema & constraints.
    Returns tuple: (clean_df, error_messages, summary_stats)
    """
    if df.empty:
        return pd.DataFrame(), ["CSV dataset is empty or contains no records."], {
            'total_records': 0, 'valid_records': 0, 'invalid_records': 0, 'duplicate_records': 0
        }
        
    errors = []
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {', '.join(missing_cols)}")
        return pd.DataFrame(), errors, {
            'total_records': len(df), 'valid_records': 0, 'invalid_records': len(df), 'duplicate_records': 0
        }
        
    total_records = len(df)
    
    # Check duplicates on Player ID
    duplicate_mask = df.duplicated(subset=['Player ID'], keep=False)
    duplicate_count = duplicate_mask.sum()
    if duplicate_count > 0:
        dupes = df[duplicate_mask]['Player ID'].unique()
        errors.append(f"Duplicate Player IDs detected: {', '.join(map(str, dupes))}")
        
    # Numeric bounds checks
    valid_mask = pd.Series(True, index=df.index)
    
    numeric_checks = {
        'Age': (15, 60),
        'Matches': (0, 500),
        'Goals': (0, 500),
        'Assists': (0, 500),
        'Passing': (0, 100),
        'Defense': (0, 100),
        'Fitness': (0, 100)
    }
    
    for col, (min_val, max_val) in numeric_checks.items():
        # coerce to numeric
        converted = pd.to_numeric(df[col], errors='coerce')
        invalid_rows = converted.isna() | (converted < min_val) | (converted > max_val)
        if invalid_rows.any():
            invalid_indices = df[invalid_rows].index.tolist()
            errors.append(f"Column '{col}' has invalid/out-of-bound values in rows: {[i+1 for i in invalid_indices]}")
            valid_mask = valid_mask & (~invalid_rows)
            
    # Combine duplicate and numeric validity
    valid_mask = valid_mask & (~duplicate_mask)
    clean_df = df[valid_mask].copy()
    
    # Cast proper types
    clean_df['Age'] = clean_df['Age'].astype(int)
    clean_df['Matches'] = clean_df['Matches'].astype(int)
    clean_df['Goals'] = clean_df['Goals'].astype(float)
    clean_df['Assists'] = clean_df['Assists'].astype(float)
    clean_df['Passing'] = clean_df['Passing'].astype(float)
    clean_df['Defense'] = clean_df['Defense'].astype(float)
    clean_df['Fitness'] = clean_df['Fitness'].astype(float)
    
    summary_stats = {
        'total_records': total_records,
        'valid_records': len(clean_df),
        'invalid_records': total_records - len(clean_df),
        'duplicate_records': int(duplicate_count)
    }
    
    return clean_df, errors, summary_stats
