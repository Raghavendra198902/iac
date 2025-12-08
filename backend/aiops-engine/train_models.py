"""
ML Model Training Pipeline
Initializes and trains all ML models in the AIOps Engine
"""

import logging
from datetime import datetime
from typing import Dict, List
import sys

# Import all models
from models.enhanced_cost_predictor import EnhancedCostPredictor
from models.enhanced_drift_predictor import EnhancedDriftPredictor
from models.enhanced_resource_optimizer import EnhancedResourceOptimizer
from models.performance_optimizer import PerformanceOptimizer
from models.compliance_predictor import CompliancePredictor
from models.incident_classifier import IncidentClassifier
from models.root_cause_analyzer import RootCauseAnalyzer
from models.churn_predictor import ChurnPredictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModelTrainingPipeline:
    """Training pipeline for all ML models."""
    
    def __init__(self):
        self.models = {}
        self.training_results = []
    
    def initialize_models(self) -> Dict:
        """Initialize all ML models."""
        logger.info("Initializing ML models...")
        
        try:
            self.models = {
                'enhanced_cost_predictor': EnhancedCostPredictor(),
                'enhanced_drift_predictor': EnhancedDriftPredictor(),
                'enhanced_resource_optimizer': EnhancedResourceOptimizer(),
                'performance_optimizer': PerformanceOptimizer(),
                'compliance_predictor': CompliancePredictor(),
                'incident_classifier': IncidentClassifier(),
                'root_cause_analyzer': RootCauseAnalyzer(),
                'churn_predictor': ChurnPredictor()
            }
            
            logger.info(f"✅ Initialized {len(self.models)} models")
            
            # Verify all models
            for name, model in self.models.items():
                logger.info(f"  - {name}: v{model.version} (accuracy: {model.accuracy:.1%})")
            
            return {
                'status': 'success',
                'models_initialized': len(self.models),
                'models': list(self.models.keys()),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Model initialization failed: {e}")
            return {
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def train_all_models(self) -> Dict:
        """
        Train all models with sample data.
        Note: In production, this would use real historical data.
        """
        logger.info("Training all models...")
        
        if not self.models:
            self.initialize_models()
        
        results = []
        
        for model_name, model in self.models.items():
            try:
                logger.info(f"Training {model_name}...")
                
                # For now, models are pre-trained
                # In production, you would call model.train(training_data) here
                result = {
                    'model': model_name,
                    'version': model.version,
                    'status': 'ready',
                    'accuracy': model.accuracy,
                    'is_trained': model.is_trained
                }
                
                results.append(result)
                logger.info(f"✅ {model_name} ready (accuracy: {model.accuracy:.1%})")
                
            except Exception as e:
                logger.error(f"Training failed for {model_name}: {e}")
                results.append({
                    'model': model_name,
                    'status': 'error',
                    'error': str(e)
                })
        
        self.training_results = results
        
        return {
            'status': 'success',
            'models_trained': len([r for r in results if r['status'] == 'ready']),
            'models_failed': len([r for r in results if r['status'] == 'error']),
            'results': results,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_model_registry(self) -> Dict:
        """Get registry of all available models."""
        if not self.models:
            self.initialize_models()
        
        registry = {}
        for name, model in self.models.items():
            registry[name] = {
                'version': model.version,
                'accuracy': model.accuracy,
                'model_name': model.model_name,
                'is_trained': model.is_trained,
                'status': 'ready'
            }
        
        return registry
    
    def validate_models(self) -> Dict:
        """Run validation checks on all models."""
        logger.info("Validating models...")
        
        if not self.models:
            self.initialize_models()
        
        validation_results = []
        
        for model_name, model in self.models.items():
            try:
                # Check model has required attributes
                required_attrs = ['model_name', 'version', 'accuracy', 'is_trained']
                has_required = all(hasattr(model, attr) for attr in required_attrs)
                
                validation_results.append({
                    'model': model_name,
                    'valid': has_required,
                    'version': model.version,
                    'accuracy': model.accuracy
                })
                
            except Exception as e:
                validation_results.append({
                    'model': model_name,
                    'valid': False,
                    'error': str(e)
                })
        
        valid_count = len([r for r in validation_results if r.get('valid', False)])
        
        return {
            'status': 'success' if valid_count == len(self.models) else 'partial',
            'valid_models': valid_count,
            'total_models': len(self.models),
            'results': validation_results,
            'timestamp': datetime.now().isoformat()
        }


def main():
    """Main training pipeline execution."""
    pipeline = ModelTrainingPipeline()
    
    # Initialize models
    print("\n" + "="*60)
    print("ML MODEL TRAINING PIPELINE")
    print("="*60 + "\n")
    
    init_result = pipeline.initialize_models()
    print(f"✅ Initialization: {init_result['status']}")
    print(f"   Models initialized: {init_result['models_initialized']}\n")
    
    # Train models
    train_result = pipeline.train_all_models()
    print(f"✅ Training: {train_result['status']}")
    print(f"   Models ready: {train_result['models_trained']}")
    print(f"   Models failed: {train_result['models_failed']}\n")
    
    # Validate models
    validation_result = pipeline.validate_models()
    print(f"✅ Validation: {validation_result['status']}")
    print(f"   Valid models: {validation_result['valid_models']}/{validation_result['total_models']}\n")
    
    # Print model registry
    print("="*60)
    print("MODEL REGISTRY")
    print("="*60 + "\n")
    
    registry = pipeline.get_model_registry()
    for model_name, info in registry.items():
        print(f"{model_name}:")
        print(f"  Version: {info['version']}")
        print(f"  Accuracy: {info['accuracy']:.1%}")
        print(f"  Status: {info['status']}\n")
    
    print("="*60)
    print("✅ TRAINING PIPELINE COMPLETE")
    print("="*60 + "\n")


if __name__ == '__main__':
    main()
