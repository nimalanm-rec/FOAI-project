from .assessment_routes import assessment_bp
from .simulation_routes import simulation_bp
from .comparison_routes import comparison_bp
from .history_routes import history_bp
from .model_routes import model_bp

__all__ = [
    "assessment_bp",
    "simulation_bp",
    "comparison_bp",
    "history_bp",
    "model_bp"
]
