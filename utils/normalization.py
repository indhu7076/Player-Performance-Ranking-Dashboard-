"""
Data Normalization Module for Player Performance Ranking Dashboard
Implements Min-Max Normalization using Pandas & NumPy.
"""

import pandas as pd
import numpy as np

def min_max_normalize_series(series, min_target=0.0, max_target=100.0):
    """
    Normalizes a pandas Series using Min-Max scaling.
    Handles zero variance (max == min) safely without division by zero.
    """
    if series.empty:
        return series
        
    s_min = series.min()
    s_max = series.max()
    
    if s_max == s_min:
        return pd.Series(50.0, index=series.index)
        
    normalized = min_target + (((series - s_min) / (s_max - s_min)) * (max_target - min_target))
    return normalized.round(2)

def normalize_player_dataframe(df):
    """
    Normalizes raw statistical metrics of players across the DataFrame.
    Normalized metrics: Goals, Assists, Passing, Defense, Fitness.
    Returns a copy of the DataFrame with added normalized sub-score columns.
    """
    if df.empty:
        return df
        
    df_norm = df.copy()
    
    metrics = ['Goals', 'Assists', 'Passing', 'Defense', 'Fitness']
    for m in metrics:
        if m in df_norm.columns:
            df_norm[f'norm_{m.lower()}'] = min_max_normalize_series(df_norm[m].astype(float))
        else:
            df_norm[f'norm_{m.lower()}'] = 50.0
            
    return df_norm
