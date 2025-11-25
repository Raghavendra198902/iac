#!/usr/bin/env python3
"""
Model Training Script
Automated training pipeline for all ML models
"""

import os
import sys
import argparse
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

# Add ml-models directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cost_forecasting.model import CostForecastingModel
from anomaly_detection.model import AnomalyDetectionModel


def generate_training_data():
    """Generate synthetic training data for initial model training"""
    
    print("Generating synthetic training data...")
    
    # Cost forecasting training data (1 year of daily costs)
    dates = pd.date_range(end=datetime.now(), periods=365, freq='D')
    
    # Base cost with trend and seasonality
    base_cost = 1000
    trend = np.linspace(0, 200, 365)
    weekly_seasonality = 50 * np.sin(np.arange(365) * 2 * np.pi / 7)
    monthly_seasonality = 100 * np.sin(np.arange(365) * 2 * np.pi / 30)
    noise = np.random.normal(0, 50, 365)
    
    costs = base_cost + trend + weekly_seasonality + monthly_seasonality + noise
    
    cost_data = pd.DataFrame({
        'date': dates,
        'cost': costs,
        'component': 'compute'
    })
    
    # Anomaly detection training data (baseline normal metrics)
    n_samples = 1000
    
    anomaly_data = pd.DataFrame({
        'cpu': np.random.normal(50, 10, n_samples),
        'memory': np.random.normal(60, 12, n_samples),
        'disk': np.random.normal(70, 8, n_samples),
        'network': np.random.normal(100, 20, n_samples),
        'response_time': np.random.normal(200, 30, n_samples)
    })
    
    # Clip values to realistic ranges
    anomaly_data['cpu'] = anomaly_data['cpu'].clip(0, 100)
    anomaly_data['memory'] = anomaly_data['memory'].clip(0, 100)
    anomaly_data['disk'] = anomaly_data['disk'].clip(0, 100)
    anomaly_data['network'] = anomaly_data['network'].clip(0, 1000)
    anomaly_data['response_time'] = anomaly_data['response_time'].clip(0, 5000)
    
    return cost_data, anomaly_data


def train_cost_model(data_path=None, output_path='ml-models/cost-forecasting/cost_model.pkl'):
    """Train cost forecasting model"""
    
    print("\n" + "=" * 60)
    print("Training Cost Forecasting Model")
    print("=" * 60)
    
    # Load or generate data
    if data_path and os.path.exists(data_path):
        print(f"Loading training data from {data_path}")
        cost_data = pd.read_csv(data_path)
        cost_data['date'] = pd.to_datetime(cost_data['date'])
    else:
        print("Using synthetic training data")
        cost_data, _ = generate_training_data()
    
    print(f"Training data shape: {cost_data.shape}")
    print(f"Date range: {cost_data['date'].min()} to {cost_data['date'].max()}")
    
    # Initialize and train model
    model = CostForecastingModel()
    
    print("\nTraining model...")
    metrics = model.train(cost_data)
    
    print("\nTraining Metrics:")
    print(f"  MAE:  ${metrics['mae']:.2f}")
    print(f"  RMSE: ${metrics['rmse']:.2f}")
    print(f"  MAPE: {metrics['mape']:.2f}%")
    
    # Save model
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.save(output_path)
    print(f"\n✓ Model saved to {output_path}")
    
    # Test forecast
    print("\nGenerating test forecast (30 days)...")
    forecast = model.forecast(days=30)
    print(f"  Average predicted cost: ${forecast['predicted_cost'].mean():.2f}/day")
    print(f"  Total 30-day forecast: ${forecast['predicted_cost'].sum():.2f}")
    
    return model


def train_anomaly_model(data_path=None, output_path='ml-models/anomaly-detection/anomaly_model.pkl'):
    """Train anomaly detection model"""
    
    print("\n" + "=" * 60)
    print("Training Anomaly Detection Model")
    print("=" * 60)
    
    # Load or generate data
    if data_path and os.path.exists(data_path):
        print(f"Loading training data from {data_path}")
        anomaly_data = pd.read_csv(data_path)
    else:
        print("Using synthetic training data")
        _, anomaly_data = generate_training_data()
    
    print(f"Training data shape: {anomaly_data.shape}")
    print(f"Features: {list(anomaly_data.columns)}")
    
    # Initialize and train model
    model = AnomalyDetectionModel()
    
    print("\nTraining model...")
    model.train(anomaly_data)
    
    print("\nBaseline Statistics:")
    if model.baseline_stats:
        for feature, stats in model.baseline_stats.items():
            print(f"  {feature}:")
            print(f"    Mean: {stats['mean']:.2f}")
            print(f"    Std:  {stats['std']:.2f}")
    
    # Save model
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    model.save(output_path)
    print(f"\n✓ Model saved to {output_path}")
    
    # Test detection
    print("\nGenerating test data with anomalies...")
    test_data = anomaly_data.copy()
    
    # Inject some anomalies
    anomaly_indices = np.random.choice(len(test_data), size=50, replace=False)
    test_data.loc[anomaly_indices, 'cpu'] = np.random.uniform(90, 100, 50)
    test_data.loc[anomaly_indices, 'memory'] = np.random.uniform(90, 100, 50)
    
    results = model.detect_anomalies(test_data)
    anomaly_count = results['is_anomaly'].sum()
    
    print(f"  Detected {anomaly_count} anomalies ({anomaly_count/len(test_data)*100:.1f}%)")
    print(f"  Severity breakdown:")
    for severity, count in results['severity'].value_counts().items():
        print(f"    {severity}: {count}")
    
    return model


def main():
    parser = argparse.ArgumentParser(description='Train ML models')
    parser.add_argument('--model', choices=['cost', 'anomaly', 'all'], default='all',
                        help='Which model to train')
    parser.add_argument('--cost-data', type=str, help='Path to cost training data CSV')
    parser.add_argument('--anomaly-data', type=str, help='Path to anomaly training data CSV')
    parser.add_argument('--output-dir', type=str, default='ml-models',
                        help='Output directory for trained models')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("IAC DHARMA ML Model Training")
    print("=" * 60)
    print(f"Time: {datetime.now().isoformat()}")
    print(f"Training mode: {args.model}")
    print("=" * 60)
    
    try:
        if args.model in ['cost', 'all']:
            cost_output = os.path.join(args.output_dir, 'cost-forecasting', 'cost_model.pkl')
            train_cost_model(args.cost_data, cost_output)
        
        if args.model in ['anomaly', 'all']:
            anomaly_output = os.path.join(args.output_dir, 'anomaly-detection', 'anomaly_model.pkl')
            train_anomaly_model(args.anomaly_data, anomaly_output)
        
        print("\n" + "=" * 60)
        print("✓ Training Complete!")
        print("=" * 60)
        
        print("\nNext steps:")
        print("1. Start ML API service: python ml-models/api/ml_service.py")
        print("2. Test endpoints with curl or frontend integration")
        print("3. Monitor model performance and retrain as needed")
        
    except Exception as e:
        print(f"\n✗ Error during training: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
