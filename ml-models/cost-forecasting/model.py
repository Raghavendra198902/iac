"""
Cost Forecasting Model using Prophet
Predicts future infrastructure costs based on historical data
"""

import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
import json
import pickle
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')


class CostForecastingModel:
    """
    Time series forecasting model for infrastructure cost prediction
    Uses Facebook Prophet for robust trend and seasonality modeling
    """
    
    def __init__(self):
        self.model = None
        self.trained = False
        self.last_training_date = None
        
    def prepare_data(self, cost_data: List[Dict]) -> pd.DataFrame:
        """
        Prepare cost data for Prophet model
        
        Args:
            cost_data: List of dicts with 'date' and 'cost' keys
            
        Returns:
            DataFrame with 'ds' (date) and 'y' (cost) columns
        """
        df = pd.DataFrame(cost_data)
        
        # Prophet requires specific column names
        df = df.rename(columns={'date': 'ds', 'cost': 'y'})
        
        # Ensure date column is datetime
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Sort by date
        df = df.sort_values('ds')
        
        # Remove any duplicates
        df = df.drop_duplicates(subset=['ds'])
        
        return df
    
    def train(self, cost_data: List[Dict], 
              yearly_seasonality: bool = True,
              weekly_seasonality: bool = True,
              daily_seasonality: bool = False) -> Dict:
        """
        Train the cost forecasting model
        
        Args:
            cost_data: Historical cost data
            yearly_seasonality: Include yearly patterns
            weekly_seasonality: Include weekly patterns
            daily_seasonality: Include daily patterns
            
        Returns:
            Training metrics dictionary
        """
        # Prepare data
        df = self.prepare_data(cost_data)
        
        # Initialize Prophet model with custom parameters
        self.model = Prophet(
            yearly_seasonality=yearly_seasonality,
            weekly_seasonality=weekly_seasonality,
            daily_seasonality=daily_seasonality,
            changepoint_prior_scale=0.05,  # Flexibility of trend
            seasonality_prior_scale=10.0,   # Flexibility of seasonality
            interval_width=0.95             # Uncertainty interval
        )
        
        # Add custom seasonality for month-end spikes
        self.model.add_seasonality(
            name='monthly',
            period=30.5,
            fourier_order=5
        )
        
        # Fit the model
        self.model.fit(df)
        
        self.trained = True
        self.last_training_date = datetime.now()
        
        # Calculate training metrics
        forecast = self.model.predict(df)
        
        # Calculate MAE and RMSE
        mae = np.mean(np.abs(df['y'] - forecast['yhat']))
        rmse = np.sqrt(np.mean((df['y'] - forecast['yhat']) ** 2))
        mape = np.mean(np.abs((df['y'] - forecast['yhat']) / df['y'])) * 100
        
        metrics = {
            'mae': float(mae),
            'rmse': float(rmse),
            'mape': float(mape),
            'training_samples': len(df),
            'training_date': self.last_training_date.isoformat()
        }
        
        return metrics
    
    def forecast(self, periods: int = 30, frequency: str = 'D') -> Dict:
        """
        Generate cost forecast
        
        Args:
            periods: Number of periods to forecast
            frequency: Frequency ('D' for daily, 'W' for weekly, 'M' for monthly)
            
        Returns:
            Forecast data with predictions and confidence intervals
        """
        if not self.trained:
            raise ValueError("Model must be trained before forecasting")
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=periods, freq=frequency)
        
        # Make predictions
        forecast = self.model.predict(future)
        
        # Extract relevant columns
        result = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper', 'trend']].tail(periods)
        
        # Convert to list of dictionaries
        forecast_data = []
        for _, row in result.iterrows():
            forecast_data.append({
                'date': row['ds'].isoformat(),
                'predicted_cost': float(row['yhat']),
                'lower_bound': float(row['yhat_lower']),
                'upper_bound': float(row['yhat_upper']),
                'trend': float(row['trend'])
            })
        
        # Calculate total forecast and savings opportunity
        total_forecast = sum(d['predicted_cost'] for d in forecast_data)
        
        return {
            'forecast': forecast_data,
            'summary': {
                'total_predicted_cost': float(total_forecast),
                'forecast_periods': periods,
                'confidence_interval': 0.95,
                'model_last_trained': self.last_training_date.isoformat() if self.last_training_date else None
            }
        }
    
    def detect_anomalies(self, cost_data: List[Dict], threshold: float = 3.0) -> List[Dict]:
        """
        Detect anomalous cost spikes
        
        Args:
            cost_data: Recent cost data to check
            threshold: Number of standard deviations for anomaly detection
            
        Returns:
            List of detected anomalies
        """
        if not self.trained:
            raise ValueError("Model must be trained before anomaly detection")
        
        df = self.prepare_data(cost_data)
        forecast = self.model.predict(df)
        
        # Calculate residuals
        residuals = df['y'] - forecast['yhat']
        
        # Anomaly detection using z-score
        mean_residual = residuals.mean()
        std_residual = residuals.std()
        
        anomalies = []
        for idx, row in df.iterrows():
            forecast_val = forecast.loc[idx, 'yhat']
            actual_val = row['y']
            residual = actual_val - forecast_val
            z_score = abs(residual - mean_residual) / std_residual
            
            if z_score > threshold:
                anomalies.append({
                    'date': row['ds'].isoformat(),
                    'actual_cost': float(actual_val),
                    'predicted_cost': float(forecast_val),
                    'deviation': float(residual),
                    'severity': 'high' if z_score > 4 else 'medium',
                    'z_score': float(z_score)
                })
        
        return anomalies
    
    def get_cost_breakdown(self, forecast_data: Dict) -> Dict:
        """
        Break down forecast into components (trend, seasonality)
        
        Args:
            forecast_data: Forecast dictionary
            
        Returns:
            Cost breakdown by component
        """
        if not self.trained:
            raise ValueError("Model must be trained")
        
        # Get components from last forecast
        components = {
            'trend': [],
            'yearly': [],
            'weekly': [],
            'monthly': []
        }
        
        # Prophet stores components in the forecast
        # This is a simplified version
        forecast_items = forecast_data['forecast']
        
        avg_cost = np.mean([item['predicted_cost'] for item in forecast_items])
        
        return {
            'average_daily_cost': float(avg_cost),
            'trend_direction': 'increasing' if forecast_items[-1]['trend'] > forecast_items[0]['trend'] else 'decreasing',
            'components': components
        }
    
    def save_model(self, filepath: str):
        """Save trained model to disk"""
        if not self.trained:
            raise ValueError("Cannot save untrained model")
        
        with open(filepath, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'trained': self.trained,
                'last_training_date': self.last_training_date
            }, f)
    
    def load_model(self, filepath: str):
        """Load trained model from disk"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.trained = data['trained']
            self.last_training_date = data['last_training_date']


# Helper function for generating sample training data
def generate_sample_cost_data(days: int = 365) -> List[Dict]:
    """Generate sample cost data for testing"""
    start_date = datetime.now() - timedelta(days=days)
    
    data = []
    base_cost = 1000
    
    for i in range(days):
        date = start_date + timedelta(days=i)
        
        # Add trend (increasing over time)
        trend = i * 2
        
        # Add weekly seasonality (weekends lower)
        weekly = -200 if date.weekday() >= 5 else 0
        
        # Add monthly seasonality (month-end spike)
        monthly = 300 if date.day >= 28 else 0
        
        # Add noise
        noise = np.random.normal(0, 50)
        
        cost = base_cost + trend + weekly + monthly + noise
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'cost': max(0, cost)  # Ensure non-negative
        })
    
    return data


if __name__ == '__main__':
    # Example usage
    print("Cost Forecasting Model - Example Usage\n")
    
    # Generate sample data
    print("Generating sample data...")
    historical_data = generate_sample_cost_data(days=365)
    
    # Initialize and train model
    print("Training model...")
    model = CostForecastingModel()
    metrics = model.train(historical_data)
    
    print(f"\nTraining Metrics:")
    print(f"  MAE: ${metrics['mae']:.2f}")
    print(f"  RMSE: ${metrics['rmse']:.2f}")
    print(f"  MAPE: {metrics['mape']:.2f}%")
    
    # Generate forecast
    print("\nGenerating 30-day forecast...")
    forecast = model.forecast(periods=30, frequency='D')
    
    print(f"\nForecast Summary:")
    print(f"  Total predicted cost (30 days): ${forecast['summary']['total_predicted_cost']:.2f}")
    print(f"  Average daily cost: ${forecast['summary']['total_predicted_cost'] / 30:.2f}")
    
    # Show first few predictions
    print(f"\nFirst 5 days forecast:")
    for i, day in enumerate(forecast['forecast'][:5]):
        print(f"  Day {i+1}: ${day['predicted_cost']:.2f} (range: ${day['lower_bound']:.2f} - ${day['upper_bound']:.2f})")
    
    # Detect anomalies
    print("\nDetecting anomalies...")
    recent_data = historical_data[-30:]
    anomalies = model.detect_anomalies(recent_data)
    
    print(f"  Found {len(anomalies)} anomalies")
    if anomalies:
        print(f"  Most recent anomaly: {anomalies[-1]['date']} - ${anomalies[-1]['actual_cost']:.2f} (expected: ${anomalies[-1]['predicted_cost']:.2f})")
    
    # Save model
    print("\nSaving model...")
    model.save_model('cost_forecast_model.pkl')
    print("  Model saved successfully")
