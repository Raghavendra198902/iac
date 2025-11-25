"""
ML API Service
REST API wrapper for all ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import pickle
import traceback
from datetime import datetime

# Add ml-models directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from cost_forecasting.model import CostForecastingModel
from anomaly_detection.model import AnomalyDetectionModel
from recommendation_engine.model import RecommendationEngine

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Model instances
cost_model = None
anomaly_model = None
recommendation_engine = RecommendationEngine()

# Model paths
MODEL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COST_MODEL_PATH = os.path.join(MODEL_DIR, 'cost-forecasting', 'cost_model.pkl')
ANOMALY_MODEL_PATH = os.path.join(MODEL_DIR, 'anomaly-detection', 'anomaly_model.pkl')


def load_models():
    """Load pre-trained models"""
    global cost_model, anomaly_model
    
    try:
        # Load cost forecasting model
        if os.path.exists(COST_MODEL_PATH):
            cost_model = CostForecastingModel.load(COST_MODEL_PATH)
            print(f"✓ Loaded cost forecasting model from {COST_MODEL_PATH}")
        else:
            cost_model = CostForecastingModel()
            print("⚠ Cost forecasting model not found, using untrained model")
        
        # Load anomaly detection model
        if os.path.exists(ANOMALY_MODEL_PATH):
            anomaly_model = AnomalyDetectionModel.load(ANOMALY_MODEL_PATH)
            print(f"✓ Loaded anomaly detection model from {ANOMALY_MODEL_PATH}")
        else:
            anomaly_model = AnomalyDetectionModel()
            print("⚠ Anomaly detection model not found, using untrained model")
        
        print("✓ ML API Service initialized successfully")
        
    except Exception as e:
        print(f"✗ Error loading models: {e}")
        traceback.print_exc()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'models': {
            'cost_forecasting': cost_model is not None,
            'anomaly_detection': anomaly_model is not None,
            'recommendation_engine': True
        }
    })


@app.route('/api/forecast', methods=['POST'])
def forecast_cost():
    """
    Cost forecasting endpoint
    
    Request body:
    {
        "historical_data": [
            {"date": "2024-01-01", "cost": 1000, "component": "compute"},
            ...
        ],
        "forecast_days": 30
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'historical_data' not in data:
            return jsonify({'error': 'Missing historical_data in request'}), 400
        
        historical_data = data['historical_data']
        forecast_days = data.get('forecast_days', 30)
        
        # Convert to model format
        import pandas as pd
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Train model if not already trained
        if not cost_model.is_trained:
            cost_model.train(df)
        
        # Generate forecast
        forecast_df = cost_model.forecast(days=forecast_days)
        
        # Detect anomalies in historical data
        anomalies = cost_model.detect_anomalies(df)
        
        # Get cost breakdown
        breakdown = cost_model.get_cost_breakdown(forecast_df)
        
        return jsonify({
            'forecast': forecast_df.to_dict(orient='records'),
            'anomalies': anomalies.to_dict(orient='records'),
            'breakdown': breakdown,
            'summary': {
                'total_predicted_cost': float(forecast_df['predicted_cost'].sum()),
                'average_daily_cost': float(forecast_df['predicted_cost'].mean()),
                'trend': 'increasing' if forecast_df['predicted_cost'].iloc[-1] > forecast_df['predicted_cost'].iloc[0] else 'decreasing',
                'confidence_interval': {
                    'lower': float(forecast_df['lower_bound'].mean()),
                    'upper': float(forecast_df['upper_bound'].mean())
                }
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """
    Anomaly detection endpoint
    
    Request body:
    {
        "metrics": [
            {"cpu": 45.2, "memory": 62.5, "disk": 78.3, "network": 125.4, "response_time": 234.5},
            ...
        ],
        "method": "isolation_forest"  // Optional: isolation_forest, z_score, iqr
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'metrics' not in data:
            return jsonify({'error': 'Missing metrics in request'}), 400
        
        metrics = data['metrics']
        method = data.get('method', 'isolation_forest')
        
        # Convert to DataFrame
        import pandas as pd
        df = pd.DataFrame(metrics)
        
        # Train model if not already trained (using first 80% as baseline)
        if not anomaly_model.is_trained:
            baseline_size = int(len(df) * 0.8)
            baseline_data = df.iloc[:baseline_size]
            anomaly_model.train(baseline_data)
        
        # Detect anomalies
        anomalies = anomaly_model.detect_anomalies(df, method=method)
        
        # Get feature importance
        feature_importance = anomaly_model.get_feature_importance()
        
        # Calculate summary statistics
        anomaly_count = len(anomalies[anomalies['is_anomaly']])
        severity_counts = anomalies['severity'].value_counts().to_dict()
        
        return jsonify({
            'anomalies': anomalies.to_dict(orient='records'),
            'feature_importance': feature_importance,
            'summary': {
                'total_samples': len(df),
                'anomaly_count': int(anomaly_count),
                'anomaly_percentage': float(anomaly_count / len(df) * 100),
                'severity_breakdown': severity_counts,
                'most_important_feature': feature_importance[0]['feature'] if feature_importance else None
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    AI Recommendations endpoint
    
    Request body:
    {
        "resource_metrics": [...],
        "security_audits": [...],
        "performance_metrics": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Missing request data'}), 400
        
        # Generate recommendations
        recommendations = recommendation_engine.get_all_recommendations(data)
        
        return jsonify(recommendations)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500


@app.route('/api/recommendations/cost', methods=['POST'])
def get_cost_recommendations():
    """Cost optimization recommendations endpoint"""
    try:
        data = request.get_json()
        resource_metrics = data.get('resource_metrics', [])
        
        recommendations = recommendation_engine.generate_cost_recommendations(resource_metrics)
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'total_savings': sum(rec['potential_savings'] for rec in recommendations)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/security', methods=['POST'])
def get_security_recommendations():
    """Security recommendations endpoint"""
    try:
        data = request.get_json()
        security_audits = data.get('security_audits', [])
        
        recommendations = recommendation_engine.generate_security_recommendations(security_audits)
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'critical_count': len([r for r in recommendations if r['severity'] == 'critical'])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/performance', methods=['POST'])
def get_performance_recommendations():
    """Performance recommendations endpoint"""
    try:
        data = request.get_json()
        performance_metrics = data.get('performance_metrics', [])
        
        recommendations = recommendation_engine.generate_performance_recommendations(performance_metrics)
        
        return jsonify({
            'recommendations': recommendations,
            'count': len(recommendations),
            'high_impact_count': len([r for r in recommendations if r['impact'] == 'high'])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/models/train/cost', methods=['POST'])
def train_cost_model():
    """Train cost forecasting model endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'historical_data' not in data:
            return jsonify({'error': 'Missing historical_data in request'}), 400
        
        import pandas as pd
        df = pd.DataFrame(data['historical_data'])
        df['date'] = pd.to_datetime(df['date'])
        
        # Train model
        metrics = cost_model.train(df)
        
        # Save model
        cost_model.save(COST_MODEL_PATH)
        
        return jsonify({
            'status': 'success',
            'message': 'Cost forecasting model trained successfully',
            'metrics': metrics,
            'model_path': COST_MODEL_PATH
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/models/train/anomaly', methods=['POST'])
def train_anomaly_model():
    """Train anomaly detection model endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'baseline_data' not in data:
            return jsonify({'error': 'Missing baseline_data in request'}), 400
        
        import pandas as pd
        df = pd.DataFrame(data['baseline_data'])
        
        # Train model
        anomaly_model.train(df)
        
        # Save model
        anomaly_model.save(ANOMALY_MODEL_PATH)
        
        return jsonify({
            'status': 'success',
            'message': 'Anomaly detection model trained successfully',
            'baseline_stats': anomaly_model.baseline_stats,
            'model_path': ANOMALY_MODEL_PATH
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/models/status', methods=['GET'])
def model_status():
    """Get model training status"""
    return jsonify({
        'cost_forecasting': {
            'trained': cost_model.is_trained if cost_model else False,
            'model_path': COST_MODEL_PATH,
            'exists': os.path.exists(COST_MODEL_PATH)
        },
        'anomaly_detection': {
            'trained': anomaly_model.is_trained if anomaly_model else False,
            'model_path': ANOMALY_MODEL_PATH,
            'exists': os.path.exists(ANOMALY_MODEL_PATH)
        },
        'recommendation_engine': {
            'active': True,
            'rules_loaded': len(recommendation_engine.recommendation_rules)
        }
    })


@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("=" * 60)
    print("IAC DHARMA ML API Service")
    print("=" * 60)
    
    # Load models
    load_models()
    
    print("\nAvailable endpoints:")
    print("  GET  /health - Health check")
    print("  POST /api/forecast - Cost forecasting")
    print("  POST /api/detect-anomalies - Anomaly detection")
    print("  POST /api/recommendations - All recommendations")
    print("  POST /api/recommendations/cost - Cost recommendations")
    print("  POST /api/recommendations/security - Security recommendations")
    print("  POST /api/recommendations/performance - Performance recommendations")
    print("  POST /api/models/train/cost - Train cost model")
    print("  POST /api/models/train/anomaly - Train anomaly model")
    print("  GET  /api/models/status - Model status")
    print("\n" + "=" * 60)
    
    # Run server
    port = int(os.environ.get('ML_API_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
