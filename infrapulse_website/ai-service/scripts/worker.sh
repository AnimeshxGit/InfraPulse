#!/bin/bash
set -e

export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
export OPENBLAS_NUM_THREADS=1

echo "Starting Celery inference worker on queues [inference, celery]..."
exec celery -A app.celery_app.celery_app worker --loglevel=INFO -Q inference,celery --pool=threads --concurrency=4
