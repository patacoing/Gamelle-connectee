#include <Arduino.h>
#ifndef Screen
#define Screen
#include <screen.h>
#endif

#ifndef TRAITEMENT
#define TRAITEMENT
#include <traitement.h>
#endif

#ifndef CLAVIER
#define CLAVIER
#include <clavier.h>
#endif

#ifndef WEBSOCKET
#define WEBSOCKET
#include <webSocket.h>
#endif

#ifndef CAPTEUR_H
#define CAPTEUR_H
#include <capteurPoids.h>
#endif

#include <stepMotor.h>

extern GUI_Bitmap_t bmbienvenue;
extern GUI_Bitmap_t bmmenu_principal;
extern GUI_Bitmap_t bmrenseignerpoids;
extern GUI_Bitmap_t bmrenseigner_heure;
extern GUI_Bitmap_t bmchoix_poids_heure;
extern GUI_Bitmap_t bmchoix_menu;
extern GUI_Bitmap_t bmchoix_heure_poids;
extern GUI_Bitmap_t bmappairage;
extern String id;
void traitementClavier(char input)
{
    switch (input)
    {
    case MENU_CREATION:
        traitementAjout();
        break;
    case MENU_SUPPRESSION:
        traitementUpdateDelete(SUPPRESSION);
        break;
    case MENU_MODIFICATION:
        traitementUpdateDelete(MODIFICATION);
        break;
    case MENU_DISTRIBUTION:
        traitementDistribution();
        break;
    case MENU_APPAIRAGE:
        traitementAppairage();
        break;
    default:
        break;
    }
}

void traitementAppairage()
{
    char myId[50];
    int compteur = 0;
    afficherImage(&bmappairage, 0, 0);
    id.toCharArray(myId, id.length() + 1);
    afficherString(myId, 8, 20);
    char input = 0;
    do
    {
        input = readKeypad();
        delay(20);
        compteur++;
    } while (input != 'B' && compteur < 9999);
    mainMenu();
}
void traitementUpdateDelete(char choix)
{
    int index;
    afficherImage(&bmchoix_menu, 0, 0);
    DynamicJsonDocument json = afficherMenu();
    index = getMenu();
    if (index == -1)
        mainMenu();
    else
    {
        if (choix == SUPPRESSION)
            deleteMeal(index - 1, json);
        else if (choix == MODIFICATION)
        {
            traitementUpdate(index - 1, json);
        }
        mainMenu();
    }
}

int getMenu()
{
    int index = -1;
    int compteur = 0;
    char input;
    do
    {
        input = readKeypad();
        if (input >= '0' && input <= '9')
        {
            index = input - '0';
            break;
        }
        compteur++;
        delay(20);
    } while (input != 'B' && compteur < 9999);
    return index;
}
DynamicJsonDocument afficherMenu()
{
    String s = "";
    char str[20];
    int compteurY = 2;
    DynamicJsonDocument json = getAllMeal();
    int i = 0;
    while (!json["repas"][i].isNull())
    {
        s = "";
        s.concat(i + 1);
        s.concat(" ");
        String heures = json["repas"][i]["heure"];
        s.concat(heures);
        s.concat(",");
        String poids = json["repas"][i]["poids"];
        s.concat(poids);
        s.concat("g");
        s.toCharArray(str, s.length() + 1);
        afficherString(str, 30, compteurY);
        compteurY += 10;
        i++;
    }
    return json;
}
void traitementUpdate(int index, DynamicJsonDocument json)
{
    String heure = json["repas"][index]["heure"];
    int poids = json["repas"][index]["poids"];
    afficherImage(&bmchoix_heure_poids, 0, 0);
    char input;
    int compteur = 0;
    do
    {
        input = readKeypad();
        compteur++;
        delay(20);
    } while (input != 'C' && input != 'D' && input != 'B' && compteur < 9999);
    if (compteur == 9999)
    {
        input = -1;
    }

    if (input != 'B' && input != -1)
    {
        do
        {
            input = readKeypad();
            delay(20);
        } while (input != 'C' && input != 'D');
        if (input == 'D')
        {
            poids = getPoids();
            json["repas"][index]["poids"].set(poids);
        }
        else
        {
            heure = getHeure();
            json["repas"][index]["heure"].set(heure);
        }
        updateData(index, heure, poids, json);
    }
    else
    {
        mainMenu();
    }
}

void traitementAjout()
{
    int poids = 0;
    do
    {
        poids = getPoids();
    } while (poids > 300);

    if (poids == -1)
    {
        mainMenu();
    }
    else
    {
        String heure = getHeure();
        Serial.println(heure);
        if (heure.equals("-1"))
            mainMenu();
        else
            addMeal(heure, poids);
        mainMenu();
    }
}

int getPoids()
{
    afficherImage(&bmrenseignerpoids, 0, 0);
    char chiffre[3];
    int poids = 0;
    int indexDizaine = 0;
    int tabDizaine[3];
    tabDizaine[2] = 100;
    tabDizaine[1] = 10;
    tabDizaine[0] = 1;
    char length;
    char input = -1;
    int compteur = 0;
    do
    {
        compteur++;
        input = readKeypad();
        if (input != NULL)
        {
            if ((input >= '0'))
                if ((input <= '9'))
                {
                    chiffre[indexDizaine] = (char)input - '0';
                    indexDizaine++;
                    afficherString(&input, 50 + indexDizaine * 5, 20);
                    cleanFont(56 + indexDizaine * 5, 20, 30, 8, WHITE_FILL);
                }
        }
        delay(20);
    } while (((input != 'A') && (input != 'B')) && (indexDizaine < 3) && (compteur < 9999));
    if (input == 'B' || compteur == 9999)
        return -1; // retour
    if (indexDizaine > 1)
    {
        length = indexDizaine;
        for (int i = 0; i < length; i++)
        {
            indexDizaine--;
            poids += chiffre[i] * tabDizaine[indexDizaine];
        }
    }
    else
    {
        poids = chiffre[0];
    }
    Serial.println(poids);
    return poids;
}
String getHeure()
{
    afficherImage(&bmrenseigner_heure, 0, 0);
    String heure = "";
    int h = checkHeure();
    if (h == -1)
        return "-1";
    else
    {
        if (h <= 9)
        {
            heure.concat("0");
            heure.concat(h);
        }
        else
        {
            heure.concat(h);
        }
    }
    heure.concat(":");
    int m = checkMinute();
    if (m == -1)
        return "-1";
    else
    {
        if (m <= 9)
        {
            heure.concat("0");
            heure.concat(m);
        }
        else
        {
            heure.concat(m);
        }
    }
    return heure;
}
int checkHeure()
{
    int heure = 0;
    char compteurPuissance = 10;
    char compteurIteration = 0;
    char input;
    boolean flag = false;
    int compteur = 0;
    do
    {
        input = readKeypad();
        compteur++;
        if (input != NULL)
        {
            if (input == 'B')
                return -1;
            if (input >= '0' && input <= '9')
            {
                heure += ((input - '0') * compteurPuissance);
                compteurPuissance = compteurPuissance / 10;
                compteurIteration++;
                afficherString(&input, 40 + compteurIteration * 5, 20);
                cleanFont(46 + compteurIteration * 5, 20, 30, 8, WHITE_FILL);
                Serial.println(heure);
                if (compteurIteration == 2 && heure >= 24)
                {
                    compteurIteration = 0;
                    heure = 0;
                    compteurPuissance = 10;
                    cleanFont(40, 20, 30, 8, WHITE_FILL);
                }
                else if (compteurIteration == 2 && heure < 24)
                {
                    flag = true;
                }
            }
        }
        delay(20);
    } while (flag == false && compteur < 9999);
    char separateur[] = " : ";
    if (compteur == 9999)
        return -1;
    afficherString(separateur, 45 + compteurIteration * 5, 20);
    return heure;
}

int checkMinute()
{
    int minutes;
    char compteurPuissance = 10;
    char compteurIteration = 0;
    char input;
    boolean flag = false;
    int compteur = 0;
    do
    {
        input = readKeypad();
        compteur++;
        if (input != NULL)
        {
            if (input == 'B')
                return -1;
            if (input >= '0' && input <= '9')
            {
                minutes += (input - '0') * compteurPuissance;
                Serial.println(input);
                Serial.println(minutes);
                compteurPuissance = compteurPuissance / 10;
                compteurIteration++;
                afficherString(&input, 64 + compteurIteration * 5, 20);
                cleanFont(70 + compteurIteration * 5, 20, 30, 8, WHITE_FILL);
                if (compteurIteration == 2 && minutes >= 60)
                {
                    compteurIteration = 0;
                    minutes = 0;
                    cleanFont(64, 20, 30, 8, WHITE_FILL);
                }
                else if (compteurIteration == 2 && minutes < 60)
                {
                    flag = true;
                }
            }
        }
        delay(20);
    } while (flag == false && compteur < 9999);
    if (compteur == 9999)
        return -1;
    return minutes;
}

void nextMeal()
{
    checkMessage();
    DynamicJsonDocument json = getNextMeal();
    if (!json.isNull())
    {
        showNextMeal(json);
    }
}
void showNextMeal(DynamicJsonDocument json)
{
    char strP[5];
    char strH[10];
    String heure = json["repas"]["heure"];
    String poids = json["repas"]["poids"];
    poids.concat("g");
    Serial.println(heure);
    Serial.println(poids);
    cleanFont(29, 49, 8, 5, WHITE_FILL);
    if (heure.equals("-1") || poids.equals("-1"))
    {
        Serial.println("rentré!");
        heure = "aucun";
        poids = "aucun";
    }
    poids.toCharArray(strP, poids.length() + 1);
    heure.toCharArray(strH, heure.length() + 1);
    afficherString(strH, 31, 49);
    afficherString(strP, 29, 37);
}

void traitementDistribution()
{
    int poids = 0;
    int compteur = 0;
    do
    {
        compteur++;
        poids = getPoids();
    } while (poids > 300 && compteur < 9999);
    if (poids == -1 || compteur == 9999)
        mainMenu();
    else
    {
        distribution(poids);
        addHistorique(poids);
        mainMenu();
    }
}

void mainMenu()
{
    afficherImage(&bmmenu_principal, 0, 0);
    nextMeal();
}

void distribution(int poids)
{
    if (poids > 0)
    {
        if (poids <= 9)
            moveStepper();
        else
        {
            int nbTours = poids / 10;
            Serial.println(nbTours);
            for (int i = 0; i <= nbTours; i++)
                moveStepper();
        }
    }
}