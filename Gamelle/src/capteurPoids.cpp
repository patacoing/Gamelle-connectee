#include <Arduino.h>

#ifndef CAPTEUR_H
#define CAPTEUR_H
#include <capteurPoids.h>
#endif

/**
 * Récupérer la tension
 * @return double
 */
double getTension()
{
    double val = analogRead(A1);
    return 5 * val / 1024;
}

/**
 * Récupérer la masse
 * @return double
 */
int getMasse()
{

    return 2.2 * ((getTension() - 1.3) / 0.00262);
}