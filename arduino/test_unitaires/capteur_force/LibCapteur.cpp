#include <Arduino.h>

extern PIN_CAPTEUR;

/**
 * Récupérer la tension
 * @return double
 */
double getTension()
{
    double val = analogRead(PIN_CAPTEUR);
    return 5 * val / 1024;
}

/**
 * Récupérer la masse
 * @return double
 */
double getMasse()
{
    return exp((getTension() + 2.17) / 0.752);
}