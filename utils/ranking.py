"""
Ranking Calculation Engine for Player Performance Ranking Dashboard
Calculates composite performance score, maps Performance Levels, and assigns dynamic ranks using Pandas.
"""

import pandas as pd
from utils.normalization import normalize_player_dataframe

DEFAULT_WEIGHTS = {
    'goals': 0.30,
    'assists': 0.20,
    'passing': 0.20,
    'defense': 0.15,
    'fitness': 0.15
}

def get_performance_level(score):
    """Classifies performance score into human-readable performance level."""
    if score >= 85.0:
        return 'Excellent'
    elif score >= 75.0:
        return 'Very Good'
    elif score >= 65.0:
        return 'Good'
    else:
        return 'Average'

def calculate_player_rankings_df(df, custom_weights=None):
    """
    Takes a pandas DataFrame of players, normalizes metrics, applies weights,
    calculates Performance Score (0-100), assigns Performance Level, and calculates dynamic Rank.
    """
    if df.empty:
        return pd.DataFrame()
        
    weights = DEFAULT_WEIGHTS.copy()
    if custom_weights:
        total_w = sum(custom_weights.values())
        if total_w > 0:
            for k in weights:
                if k in custom_weights:
                    weights[k] = custom_weights[k] / total_w
                    
    df_ranked = normalize_player_dataframe(df)
    
    # Calculate Composite Performance Score
    df_ranked['Performance Score'] = (
        (df_ranked['norm_goals'] * weights['goals']) +
        (df_ranked['norm_assists'] * weights['assists']) +
        (df_ranked['norm_passing'] * weights['passing']) +
        (df_ranked['norm_defense'] * weights['defense']) +
        (df_ranked['norm_fitness'] * weights['fitness'])
    ).round(1)
    
    # Map Performance Level
    df_ranked['Performance Level'] = df_ranked['Performance Score'].apply(get_performance_level)
    
    # Sort descending by Performance Score
    df_ranked = df_ranked.sort_values(by='Performance Score', ascending=False).reset_index(drop=True)
    
    # Assign Rank
    df_ranked['Rank'] = df_ranked.index + 1
    
    return df_ranked
