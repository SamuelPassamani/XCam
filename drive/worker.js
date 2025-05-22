/*  ░ ATENÇÃO.  Está é uma modificação básica do script GoogleDriveIndex e é possível fazer várias alterações, como a inclusão
de várias contas de serviço, vários drives, vários usuários, vários domínios para visualização e para download, a fim de deixar
o serviço mais profissional.  Caso deseje, pode contratar consultoria pelo email mkgeew@telegmail.com */

// Você pode incluir várias contas de serviço colocando entre chaves {}, {}, {}, caso use várias contas de serviço, elas serão utilizadas de maneira randomizada.

const serviceaccounts = [
  {
    "type": "service_account",
    "project_id": "drive-index-400102",
    "private_key_id": "3402c909f8522b69dd974a2fefd228482c93cace",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDiQom3Oz76c0FT\n/brHR7uyKJvlozRTjN8/z5w6IPL/bLgwN+eoU2GkP+pURTXM2ze1AqtygqF2OR7R\nMS0GiYPJPR48CNWdYyhbfIKrWz8yUf3KNgMISwbRnLPOD2u0mjD5LzW+z/MRvLYr\nd43uoHsNVmLecX84Lxblmv1v5QnCohPs791xGF6bW7Bn6xjE/iNvnFv5dAjaJQoU\nmMa3jB1eoe6jseUlgBP1QU1nTWQDR1AwNF1Z9dv0rdVzB6wV3dPK2Vi1t6pja/Yu\njtqB3dZ4sawm8QTxqZu3KqgRAeWsnHLB6ZTEHj9enL4f+LauAn8bOymxA6z2+SYj\nqc9DQd4RAgMBAAECggEAaC0YuZv2yFwO5Tw7Jow5uLMH7LizXBDNrdTKat1G5SJK\nwDDNYexaVcT0AK8JMXRx9s7u37+T1hpAvTL2Nz9TxXF1nVC4Akpoh48RnxJZS7MC\ntnsd9FCPKC4Nf8AL6FDiYalCBsQ6d507B1J5sDiFz8NJrH/3gofz8+3j6QQ89TbL\ncwTiWMZF0wa1FeFU03hXw6D6wHctMPTMxFupIygEzELOP7xEbxBnBCDXl3W0NXp+\n7zB6oNMw3esBiTzCm8a+0nHAKxqAeDhdS9oXA/uuoysSHNzJRB7NVlVKIqpfzg4o\n3GZd3myT+geCP3QhUwpYusIHVM6RxG8bo4OuoW8TTQKBgQDxs+GYZUBFooY1R4P0\n6XQLNZVr2cdJ1nCYYTYSB3CF3F9FIosIF2ayyQe7i7/UfCN1dyoFGjM32UjY5n3j\nZBCRTS7Kb7CCPeXjrlNlmpu3M/ySqVv9KEJUK8YlQz6Tk6zDo9ENSzh2qgLXwEBy\nZxdilP9wisV+bwddnWqNqonL0wKBgQDvpM5kSWOgUhraN41AglsXlzLoEZvzeA1o\neA3uWH5pe0pANySSSL2o+brxONJklMSCaspYGi2tA52HCYUK9REzpqnuZZCxKbut\nY3xXm6cgIo/6+YgvTiZKElB6A88o/35XMdpOb+jPMMITuGpI++64EPaSF1ZupLbY\nbSQDbQv0CwKBgQC1WvlMtbwyA66bz5tNatWti3kgQXntBz/YtigyAu8FIcNCRpb3\nbUeboodwy30WXEbm3pDi3zPLFfg490lCE1TzEWyobIGOWA9kdOsSc52fKxy6luT0\n4P5T1byJPRl49fdNnF9BkE0/jHUxmYlBzeSYDaBUu2tQYNKwBWtr/KgEDQKBgQDq\nc41sthQfBFS7C0BJTX87LDSksJ2na9uKSnIuris2nWU+P/SqnTnYeEI5v4Ku3pEG\nmt3Npgbrzq6uL1UXLD2hD7wOvRT7Dr5LWxqKR4ERQl8khj6DMWzqaNKNHO7uyE9d\nlStkM75L/gLR8kkhkECzmfzxXp2z77fnM5fZNjVMkwKBgHc/iS5WugS6/y8cNBNj\nMpJLAKXeg914ASPdPXh7pOo4/5wjIeFc/a4f8E/xnGXS91PtIbLveTD8deqadoXx\nlCLKf8dtjWACDeyiNCiFgP60ya2T8O6UkvY+g0p7ueEGc3YbW0mJnC3upg/sjW+z\nEgN+GK7BqElFuuUZtju7Rs9M\n-----END PRIVATE KEY-----\n",
    "client_email": "makingoff@drive-index-400102.iam.gserviceaccount.com",
    "client_id": "106058211760705871040",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/makingoff%40drive-index-400102.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  },
  {
    "type": "service_account",
    "project_id": "drive-index-400102",
    "private_key_id": "90a36ec783776c8ca75c1ccd49f4df729e65af79",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDbZ9z3B/u+QKDH\nmbXVlEthqzw5vr4bl7g3DEIBcml1RqfSD6HPU5YikZhQVVk3CHYfPIwzrWQTbUZE\nswYvMeuGap0YHGD3KWzRIbOoLDYbepu5rHS0Jcb022xaQCYTDj9UFoe4f9FZosno\nk+76pQIFggMiy6MRADTS7u9nhAnuMvO4IY/Qbk/tn5XGN/QWjcJiWRv12hdMPeCe\n/9T9d4KskryaL7nUaEh08izhVAeTThfWoMtY/pQlVUs2YBzP3zOcvwXGNxgkeuJ/\nL38aweM2rXngfHIGZNWnwhJyrAxDDv0vN+2f4i9w+UTiPEaCFoi2Jfc1Yc4IQ7fT\nX+KxboGzAgMBAAECggEAOH2zjP9HOCMXwoy3HrjB9/HI3e1YsW4NBk9np0u4D3QT\nvag8t08ENv5Zw0VWZS8OithiGOQqAj5+ey3FB93IkKFetViJNto5pFcTFNfdTpHx\nCot2uPOJGH5ulYYyx3FBqPrsEvsGAhhB+Foui+Z0cMqa2BiqcbQl5bGTfommrOeD\nMUniQprQ4uRR6ZSE3XzSukuuDT4Lc4KwUV7x8ftTjJHa6qaSDYN6EfZmps35B+qV\ne6/IUc0zkVp+o6PuyQpM2ZFVqCfSC3s+sNiMtWi8hFWnvxRdf2vyl8qXf14M2BRT\nITwU6iAhRMg+tZpuOmCTLHEJwhpRvk7A2BWxMZHYAQKBgQD+qduXjLCXxag/xu6m\nVdqi4my3e0B+tg8C7+hGk+mXFJuWPbQA6MtAVmWKXldM7Fy4q6LzJX7ZTCAoNNFo\n30kujz0oC463Lo9inOoBMyovzjxIXk9U19DDt77PDZFNiKOmi6igvPuBsL+geVB9\nV7OsGVP57NXCizhH42k0OhH3swKBgQDcjqLirwQXZ+EsdbTsBPHePwt9AxRKbldY\ncu8W+FO6/IeWj2+qalS7VLQhqLGK9JCeVkVsKF7ZHzT0baD+NByufM0JTwpplqe2\nMhV3YbMKYj/qdykCTTuXTAYQyMGYbxdkgxrvNzzMzswFuH4CUZOZRF5Z11Z+HPE7\n8qfsWIxOAQKBgQCSMwGWJ3baKudEdfhcFb3G9SZkz6VfGTXVAdXfbtsTmQkZX6MP\nQpYtAWyZ2z9TMf6pJiAOZuBD76gmbOwrwMRKroD1lG0CTQCUJHFS7wSxHT0ObtYs\nZxm6wqoQREG+uUr6OgM9BEF/WvEoN301+Dt1+bR0LrspTLOq0at8CDp4cQKBgAlv\nwOBaBJ7LvwKb9qWygHa109QBcbjNh8ctA7XD4jE55MM4V9q+uelZ8msOQKplVFqx\n7j52a7h2cVmT5zN5H1EH3e3sB9IEtCBDfE+jSnnDQmDRwFts2oPaqNfG/yF6f1G5\nmklp35wTrP8BqcKHov0Hw9GsOPMkYd3iv/SIxVgBAoGAYRNvMIOPx346y+3kEMga\nQHbnv73GqvrAlA0JjdPnKhHlKXDY98WeRDgbTItFr1bHBMTxXcrzeZ0+47TEg+BM\nPZW/2Eay1ssmpoZ/L5Qryw0amEij6w0KOzaoUSFuucqvEgPbnRzTf+bCOuP/OfLI\nG7uC1RObd+U0VJyhyoBsbnY=\n-----END PRIVATE KEY-----\n",
    "client_email": "moff-02@drive-index-400102.iam.gserviceaccount.com",
    "client_id": "102370458179609490733",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/moff-02%40drive-index-400102.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  },
  {
    "type": "service_account",
    "project_id": "drive-index-400102",
    "private_key_id": "d4de697264a75722b77ff099ee5f6e8ac23e8579",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCSHPEB0cvCVF/z\ninNnhrOawfxdN6hml+AgKSh9QAmy478qKLS4fE/XdNqfzqejFiH6oMiGvTpeglxD\ngyHoP0BOW0dOEomeZPw8rjXU13LqOcioFl/fhZpENwttVWA0SzGMGmqgrPx5myWu\n6tGt1sFLqxL8ZoB7iPpgodjTjhVDh83w9c9Bzx3pZXBlWJtHMcrTqV8O+mndtNXA\nvRQ79sghb0V5YiBqWavBv+dXjpPnf047s6n+RbFTdrDBjzx1u+M4qTklwVnWG89g\nki5eXFyTUSX2BbSjFZwvkdTvAHrGsQx0inz8H+nR7AGVw9mtSgJp26uFQrVRi/6M\nHawl78AZAgMBAAECggEACo6xidl+PO2CjNr8RXbVz6j0Wopw3i/bY4uBx9IKmVzM\nJWhRTZK65KUmfl1M3tN0s1KuhpDR8L3/22d0Wd8HHxpIk88yVynyEVLfpCBIpvyz\nn1SVixWw3Lyy9EyS0dh8jSRj/7XcHM/NaF8CdUqDBzwGWEsyParbN4P+QiP+LJW9\nmte9nEKLnuOAHHvGaaLpoCGwSAlZGcPVQ6JD2VKmfzdhMwwzU6/aCnjPFt7cib+e\nUL0vOVdA6ZvoJR9MWjbuntjrOcHjrVyP8c3UP2sZhqDqWfEkAeUZA+EhGADS2Urj\n/Cdw1ZSm8333GFTuhx4ZCpTSw+pYN1/KNLIgeGLXEQKBgQDLnDjueu3vsAvBvMLa\nDrMz5TzRkNE19Vk5RozkHyNeOigeat6Z81kg45/yUAVk1hU+75aCXkqlEb4gvizS\nU8/OnllBXi9+DrHrBNKL6y/0bp9movcvuih5M5suoQibUAucnorYuBPlxG9MKYtC\naF63cokRrAH+2jECTlX6x8LQKQKBgQC3tWMlUBsDIJcrjCllDRfB/tW7w4cpE2ah\nopqpkeAGxOiQRTxheQo/ZO886hM/YALEASoxOeac0SexHgviXuNIv/2rV040WDsJ\nyGBh+a3fc2dhahLd+UfpBm4V9Dssbv2Kpdq376h8ymGnMgJckdI05Ie7K9UCTWBm\nj2hxCoaucQKBgQC01yw5pDVwjYvjpyPpSOUhUpmSCG3I3wFAPcklVAK1zjGT0pej\nZN/ktkd5kFk6FmsIWwPzBoyF0BxuOHrW1Fndyga8aEsGS0b61m2qmFkfYKFzJ4sk\neNM50vwhjiV2zMGDec0Yb2Y8zRuNKdjmQozdonzblUqwcFrXEXyMIKCHAQKBgE75\nrYvG6jXn9tUDxm/otwPxF9VGc36XFpH6I18ulQ6T7B7JhPGqZVtneunG/0tJbSby\nET9kUt2rlNKxxg4lGLSXxOe5+qbKH2dPOxAjlDnxlMnuHfpLRjzJRN4vRpkNhfXq\n4yIb52TuZBjKiPVewu12KVuvtjztIro0gIPIMKohAoGBAJTTw/vkXgL4bAJLfYhj\nJKP7xVJ57IobC+aUw3e9yfAb7hzWTJ7SC1+Ym58XG4X3kv3HMp6BNKTbQ/yykyHl\ngQ5+YDzKrZEIjm23nsvIfHoa4ViYwQLS3xoLjP1kShq6Uu8iAri9zdJr43lv0OH9\n/LHV3QahW7TjwLqiDSDcHgZM\n-----END PRIVATE KEY-----\n",
    "client_email": "moff-03@drive-index-400102.iam.gserviceaccount.com",
    "client_id": "116347452125534815208",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/moff-03%40drive-index-400102.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  },
  {
    "type": "service_account",
    "project_id": "drive-index-400102",
    "private_key_id": "4b16c87b0b16dc1b4d259f3850dd9058ac2290a1",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDWJi7QZbZMPYrI\nsF+I3CJe3sdw0TlNyeliKRuEzMgLAOuaVpHAPJM+EKRwG/fpjgShVoXcwhhek1hz\ne3pwCTQcYNgFRe2axV09jSMV+sXrqXJRdptOwbN3lyc2OADDBAwDjlaphsH2FXSG\nwoNFCrCfgFz3w0TdhpyNv+maMELnXc5x6QwqtYaI/SsDvG6h3TrjRTwr2drQVp0t\nw+/oUuklWe3hNnx4poTyzdb1ReIL9o1Jkv1r5zmWrnt3QhS3DVR2mEFS93DHVOIl\n83SLh4t3CDMDDS2EJfyxsPoSFQBHiU2NxYcicSsZpCuAhK1uMXPX9zBf1LaJeesh\n35gQ3jQrAgMBAAECggEAQRjmTi89FTv3/j2vLNlOEWzDT8YqFz1zloVMejgN71pe\nRFJgiAFh+RHyCqpV2Ed1nN3CX3MZGVbNIn28oGYL0zyVLjUtn0izqUxICBxtIdAm\nkiDt4Sj8tzPZlZ+8i4ulY0dXjL0MJRQskfJ7GPfA7RuGJ0LSokyTNnvKNTbKf63z\nsqZ4Mtjh7IAv95Y1RYPM896b19ORxr+L8NSTPs7aAbKdjlnjJE/x35Zb7wMH5pSO\n3BxpipQwX4bvMIHGXymQDr5NJ1fjD2/Lr2izUrwpB5EjUzZj+vY5wGzIBP1Dxa4N\nlKOe1bzbX1SOC5gLl293bmKx8g3yt0ajsM5IsAWeMQKBgQD6SrhpdejeXnLYiMSp\nrdevwY4gamSM4Lzy3gNnIt9v+SYCyt74VT2hi7OI7rcA+P3J1Ulg/qjWXm/xOY01\nlbX8ERNygciqSrLhjy/ySPmR+wBusR8rqlyPR0MZ/kO46NPPmzRCuShVVSCW105J\na+gzAGZakgaOmFX8gBVq/eajVQKBgQDbCHNKgwenm9NUncoWyUtJtAGxtgDjMuRk\nh9LHy9LPi0khbkuSc2aMFFG/EDWB/P384rsU/93ytS6Yvj8nO6i45aE70P1MFdi6\nuF/pOOxznZEmGtuXLWmov8xrta/Oq2aTebWjywbFa31EN6RYwkdq3SQecueqnKVy\n6w+6N0B5fwKBgQCteny3G/J7rhsL2j/1G3kTaKSJ8zQeMObFrvvM0G7tvVKLPPGu\nTeaZwap+jnZpRishaaOiht+fNXWBTNKDAXFRdMR16V6cKYoyrHwfAlV4yPBTyJBC\nQ6JD7LClo4Zs83NbwcdHN+6stoQQCMtKOHCIaQ6IWA4TZ6KxkFVIAxOIwQKBgC4l\nDp0BE+jE1HX8NCouyFTDvqOg83jqLOHdF5QOJeChuIt5gCRfeZhDY6F8GbnEAgJ4\nBe/7o9fRQfreAdITKI2jmx9N/T89Twavd01cN7x30q+TcvXblGn/1mJOybYhuB+T\nwae7SzbmWWK40j/81iz2X/imPpZcICMg0JRrtYKjAoGAZ4GomBb/hYuqlblfBucw\nYZpbzyJxA/db4J/4U4ZBrAVdJBsCXzyzm/9DitBMdAAJ1L6U6BkMpmdjTNdWkOQm\n5re0Jflm/ITk2IvlO/hUEmzBdgfvJGq4NH2JkCsFQ12Fl82QSZydffsugY6/tIvi\nmKA9mcgw3J973eRgnz5WYzs=\n-----END PRIVATE KEY-----\n",
    "client_email": "moff-04@drive-index-400102.iam.gserviceaccount.com",
    "client_id": "103368438902787913834",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/moff-04%40drive-index-400102.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  },
  {
    "type": "service_account",
    "project_id": "drive-index-400102",
    "private_key_id": "80ef78d58c3a1dc7ba0deabe3a3b3f4c668fe4a8",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCoKtDvlz5Edl5Y\ndl69uv4iU3aos33+fjw+gZA4c8CFZcgxQFw6E5mTbKW/01GiXpamsxccQX/zmL33\n0lcv1VjkAHX2/WMM936TyYdJTU5wmljc7bRg6hup5YoFOjuLLgYw7f12ASg7hn59\nvSiRG0Tt9kr65tU5j5QUY4PodzPnosjhnQWpM9yrM82qckWX+CT4XqXfDn3edtnN\ntWTt0xXv/fEOQjhe8TpoDB8N53ZXcuqtJ/vxciXgLSf7G7u1gJgVkJ7010p9VuP9\na1MtncP/jfKQVAxoSbcYlFlgVq9nVuF46T91duEac0xGOd0MxM7VTG8OGezAhori\ng4EyWB4rAgMBAAECggEAMA1P924xkjF6gu+L4c35SQitWsYzJdGfWEMAWUkmBVgQ\njJY15DhuhTQh5n61EF7T0F1TKLVEoPAPtC0L0bS2OiwxiPpdX7qmlgcbW6Q12jIY\nW0Sm6pxqfDEFL7o0gnALv9Z5OstY2i1znm07Fr+CgjaCtU/ZNKHkr7DB496P28tu\nXdcv4lynEnF/YvuWHc0+SwKI+neTimNgyeFSHRyy3wOWrt1ZCnE2ARytB1e1bA2n\no10PcXw0jREt/1c6QNLyAwn2tvhs5Nn/1WgLNgQzJoyidcEZ5ZDMA9q89Sr+vm5v\natGUbSxwrbfn0yHkVfJGUFkupt+MNdTEDfMYX4LpyQKBgQDj+2czK7OXWYt+puM8\nXG/Po+t/jkPkvUyXnrVbmPEzMN+RCG3ysc8djUsrkUSRpj/uTY9/AbQMVFOv2XBb\n3jHrgac+y0dL8vhTEpOVDtsmXq+Gcm6u59b4hOmsrbLEb/yCeVW98k7yj3lL0Dix\na7phFVIsPQX3htSEcSNGqfq3MwKBgQC81ZDSzdJGI0zJhaWzSbCzbxUMlnZR0ytZ\niTsGTDKFbdWowBNA2L7U6MUzYeMEkzECAWIHDHESs1Oe71MqFotPzamwNC65VHmc\nTl9MIo4T7eCkxop0XsL0bfeIVC2S5S65Lc9ME+2U2Ulkd3wff60sDEeDR28jh2YP\nWKMbY9AdKQKBgQCmYbLGWI1/1n0EmJ1cTwXW3wWemOAZzsFYIh6vU6YsOu3ede1v\n4q6KHbUPfbwyI8eijf48rayOFvjgbGsg0L9T5dJ99HL7Db6HOhZ1AVuU3CNzlo4K\nne54ft/fAwFldWkue4jE0FMnmOfoGXVWno1uDtZirMJvDHqKkdsx1hnAmwKBgFjp\njhlUBDA2Ks+weAblKagzI4wbxHZeoci0zu/2LMuancGpPueHpsMFHuVEr+nVjHvP\nPuLmvs75VOQ+97+Xgdz/j2iCCYYF+oTYehKVKqTDmsS7HzIP9Ge255hvWk4ST1+t\n7C98Kp+td9swT2ddbKKS3ZE4r2HhPPL430PkSXeRAoGBALihBbqVPo1y4LAutiSs\nv/1yQzOJfZE0pjyEfPpVWyVcKXc0F1xgtyWoVAjAeSeAuYxJpJweiotpspig8cOT\nLiB+jJRmGQnm9ayuKZGnfBFE/5ZpDnrU2msElQqCRdSZfYUjXQmx9EiW2i/AY0U0\nhvWlC/eubJfNKs0eRTI31fej\n-----END PRIVATE KEY-----\n",
    "client_email": "moff-05@drive-index-400102.iam.gserviceaccount.com",
    "client_id": "115062076689702501609",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/moff-05%40drive-index-400102.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  },
  {
    "type": "service_account",
    "project_id": "drive-app-filmes",
    "private_key_id": "c249012e24514bf5e0911522ac6caf21792a8b53",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC8p2qNNv4zzC12\nHCVn7O8radlHWppldnmP6MijsKkFpt32rA0G1ZiELm2Q8u4GIyY4sP3PiwZhRdoa\nCco2PFP01nrIlI+rJWN4m6HDZOOZ6LUxs9DVWk5sYrdd1XEAWUVlDQjHI0Rpf6Qr\nG8FntCfi9xU2zc+swnBSX+KKue8PI2HDkE9wCM9QeMxZSr3k1/PRAEt+8kntIzNO\nCPmwEDifQNx2H16CpEPcHe0BG7ad58K8y3tzhqxNpg1EjkcIVrtfwyg9MHmrWfBQ\nCUCsngSX7oUCjN/0EVdu6ZJ/xJ7yVS6Fk/F2/n4lPwu8/HHcQuUlaX0kju924x1M\n9bHbd24ZAgMBAAECggEACnsen1PT0ZrhV7N+nIR8USQjTySIeWSYolcjdnylF0xK\n/p5WZu/M9mMB8VCdyrd/Mx0aLMKjixnvYQz0MAkv/OVBkw014iNEoHm9Bfb/8hgM\noQNFceT/gGQHne3yxjsvcMrFlxKthVLzEvYKy7ElmiVyB0Zt6EIxLVJoap6j2mpb\nYw6v7hQEimep65URUAUtXLJB2s54+xltPMFbvabX6+JqdAfrfWBUfhSCq23O1cMs\nHoyVw1lt2StVvbWgcMMvvOzHQ4FI18GL+RJQCuL12r+d8VCUKRv+6173rANF5PaD\n2kyF6Y9d2e9uXkuLdaW4aDgZ7KiRccMXReD2sCA4BQKBgQDfZ25oFItnudmEyfy2\nRES7cLv0fel8xzDNtxVeFiAEy5Zmrws6mRS75oef+lHYX/W0V3G2G8HZXzakA1OS\nlKqd8OBTznxuwIThcw68fy87I36y4OyFYSPMtuLzkSKWejACl//ZMD4Lb1dZudTv\nvCkCX/8Q8Yspr1/DbtGX0xmsGwKBgQDYLgDt16lgGxKQzk3BhYqdj8DSHOyxMd73\nroizgZHgPzeMmNvI+vCjj/0KumXeRa3dDr/E7PQzAOn36VDFlIiSs/b+4UVHhaDW\nJkrNf0YYbw9gcb5XyJBO7eQ8bcIH4+b1u1m47gAezyBqGqTjj+HGOrpa/XlTAndB\nVODqWyDJ2wKBgHSb6GUrVBiwSXmmdOIugDHWhkT39AfNcQvvpJeXtN7L5ZVziMjt\nXoU1r1Uxs8bdT8LyYchMdMKhkEPL+LNqJiSKto0IGqs0kiebhvWc7WpQ/LEh9lMo\ngSc5zvyTpRombSjtbf5P0BLn6xBKj3sTG9TBhsGxUpJPmAzKq1w0NBJBAoGAcP/z\nCmAtsAfWt4yvRlYYs+2dm/b0nlb0NsGrwTEcYHyK+9o3IKJTQRwV6BKxBvOjQybf\nhP9bUoHKywTRbMYMcarSlD6KqS0nemk/tpUtvb3n6sDp/xben/Nn11KEFv3BD3fk\nGW+G7pPUXMIaqLzgBm9SVBek4IgscCD/BGGoDPsCgYALP+nIf9ybSPfBjXqa3QCr\n9zVcyO4OneL8jk/1GeDMTbwnAQGc77JKzPbLi7+X24OCyuUggHCCzJ4yDeQjk36D\n/Lo/UlKvihs5r1Llm3xqMiOjprruOX7wMbzPj4eVd3vWpXIBpxdjHOgTcFI26zlr\n28u8TyA1+mrPlHABldo8ew==\n-----END PRIVATE KEY-----\n",
    "client_email": "drive-app-filmes@drive-app-filmes.iam.gserviceaccount.com",
    "client_id": "109404840898175796105",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/drive-app-filmes%40drive-app-filmes.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }            
  ];
  const randomserviceaccount = serviceaccounts[Math.floor(Math.random()*serviceaccounts.length)]; // Não coloque a mão nisso
  const domains_for_dl = ['https://moff-app-02.moviele.workers.dev', 'https://moff-app-03.moviele.workers.dev', 'https://moff-app-04.moviele.workers.dev', 'https://moff-app-05.moviele.workers.dev']; // Incluir vários cloudflares exemplo. ['https://samucatutoriais1.workers.dev', 'https://samucatutoriais2.workers.dev']
  const domain_for_dl = domains_for_dl[Math.floor(Math.random()*domains_for_dl.length)]; // Não mexa nisso, ou nas linhas abaixo, a menos que saiba o que está fazendo.
  const video_domains_for_dl = ['https://moff-app-02.moviele.workers.dev', 'https://moff-app-03.moviele.workers.dev', 'https://moff-app-04.moviele.workers.dev', 'https://moff-app-05.moviele.workers.dev']; // Incluir vários cloudflares para balancear o download. ['https://samucatutoriais1.workers.dev', 'https://samucatutoriais2.workers.dev']
  const video_domain_for_dl = video_domains_for_dl[Math.floor(Math.random()*video_domains_for_dl.length)]; // Não mexa nisso
  const blocked_region = ['']; // Inclua códigos dos países bloqueados separados por (,) virgulas, ex. ['PT', 'US', 'PK']
  const blocked_asn = []; // adicionar números ASN de http://www.bgplookingglass.com/list-of-autonomous-system-numbers, ex. [16509, 12345]
  const authConfig = {
      "siteName": "Site App", // Nome do seu site
      "client_id": "", // Caso tenha criado no google console. (Opcional para contas de serviço)
      "client_secret": "", // Caso tenha criado no google console. (Opcional para contas de serviço)
      "refresh_token": "", // Authorize token (Utilize o Rclone no seu computador para obter.
      "service_account": true, // Nesse caso iremos utilizar, caso prefira gerar o token pelo rclone coloque como falso
      "service_account_json": randomserviceaccount, // Não mexa nisso
      "files_list_page_size": 100,
      "search_result_list_page_size": 50,
      "enable_cors_file_down": true,
      "enable_password_file_verify": false, // suporte para arquivo .password
      "direct_link_protection": false, // protege links diretos na Interface de usuários
      "lock_folders": false, // mantem as pastas e a pesquisa bloqueadas se a autenticação estiver ativada e permite a exibição de arquivos individuais
      "enable_auth0_com": false, // siga o guia para adicionar auth0.com ao índice seguro com um poderoso sistema baseado em login
      "roots":[
          {
            "id": "1EpBIC70TDpZ_KaO0JYLZ-0rVxzsKWI4z",
            "name": "XCam.Gay",
            "protect_file_link": false,
            "auth": {"contato@makingoff.eu.org":"Lv1991@rq"} /* Remove double slash before "auth" to activate id password protection */
          },
          {
            "id": "1foMwh-HqbDygrFhIqY3yjcqR8f5p9XOv",
            "name": "xXx.Filmes.net.eu.org",
            "protect_file_link": false,
            "auth": {"contato@makingoff.eu.org":"Lv1991@rq"} /* Remove double slash before "auth" to activate id password protection */
          },
          {
            "id": "1gmOztBf0CNk2_Li-_5CEiBDVsQraoT6p",
            "name": "TorrentXbot",
            "protect_file_link": false,
            "auth": {"contato@makingoff.eu.org":"Lv1991@rq"} /* Remove double slash before "auth" to activate id password protection */
          }   
          ]};
  // Não iremos utilizar auth0 nesse script
      const auth0 = {
            domain: "", // Tenent Domain from auth0.com website
            clientId: "", // App Client ID from auth0.com website
            clientSecret: "", // App Client Secret from auth0.com website
            callbackUrl: "", // your domain with /auth at the end. eg. https://example.com/auth, add this in auth0.com too
            logoutUrl: "", // your domain logout page eg. https://example.com, add this in auth0.com too
      }
  
  /*
  Edite os valores abaixo░*/
  
  const uiConfig = {
      "theme": "lux", /* Caso queira, alterne entre um dos temas a seguir cerulean, cosmo, cyborg, darkly, flatly, journal, litera, lumen, lux, materia, minty, pulse, sandstone, simplex, sketchy, slate, solar, spacelab, superhero, united, yeti, vapor, morph, quartz, zephyr */
      "version": "2.1.8", // Deixe exatamente como está, a não ser que já tenha uma versão atualizada.
      // If you're using Image then set to true, If you want text then set it to false
      "logo_image": true, // true se você estiver usando o link da imagem na próxima opção.
      "logo_height": "50px", //somente se logo_image for true valor em px
      "logo_width": "", // somente se logo_image for true valor em px
      "favicon": "https://i.imgur.com/FKLYwwW.png",
      // se o logotipo for verdadeiro, coloque a URL da imagem, caso contrário, coloque apenas um texto
      "logo_link_name": "https://i.imgur.com/UlL2g2v.gif",
      "fixed_header": true, // Se você deseja que o rodapé seja flexível ou fixo..
      "header_padding": "120", // Valor 80 para cabeçalho fixo, Valor 20 para cabeçalho flexível. Em alguns temas poderá ser necessário alterar.
      "nav_link_1": "Home", // alterar nome do link de navegação
      "nav_link_3": "Pasta atual", // alterar nome do link de navegação
      "nav_link_4": "Contato", // alterar nome do link de navegação
      "show_logout_button": false, // mostra o botão de logout se auth0.com estiver ativo
      "fixed_footer": false, // Se você deseja que o rodapé seja flexível ou fixo.
      "hide_footer": true, // oculta totalmente o rodapé do site.
      "header_style_class": "navbar-dark bg-primary", // Caso queira, altere para uma das opções a seguir: navbar-dark bg-primary || navbar-dark bg-dark || navbar-light bg-light
      "footer_style_class": "bg-dark", // Caso queira, altere para uma das opções a seguir: bg-primary || bg-dark || bg-light
      "css_a_tag_color": "black", // Nome da cor (em inglês) ou código hexadecimal, por exemplo.. #ffffff
      "css_p_tag_color": "black", // Nome da cor ou código hexadecimal, por exemplo. #ffffff
      "folder_text_color": "black", // Nome da cor ou código hexadecimal, por exemplo. #ffffff
      "loading_spinner_class": "text-light", // https://getbootstrap.com/docs/5.0/components/spinners/#colors
      "search_button_class": "btn btn-danger", // https://getbootstrap.com/docs/5.0/components/buttons/#examples
      "path_nav_alert_class": "alert alert-primary", // https://getbootstrap.com/docs/4.0/components/alerts/#examples
      "file_view_alert_class": "alert alert-danger", // https://getbootstrap.com/docs/4.0/components/alerts/#examples
      "file_count_alert_class": "alert alert-secondary", // https://getbootstrap.com/docs/4.0/components/alerts/#examples
      "contact_link": "mailto:contato@site.my.eu.org", // Link para o botão de contato no menu
      "copyright_year": "2023", // Ano para copyright, pode ser tipo 2015 - 2020 ou apenas 2020
      "company_name": "AllS Company", // Nome ao lado dos direitos autorais
      "company_link": "https://site.my.eu.org/", // link do nome dos direitos autorais
      "credit": false, // Defina isso como verdadeiro para nos dar crédito
      "display_size": true, // Defina como false para ocultar o tamanho do arquivo de exibição
      "display_time": false, // Defina como false para ocultar a exibição da última modificação para pastas e arquivos
      "display_download": true, // Defina como false para ocultar o ícone de download para pastas e arquivos no índice principal
      "disable_player": false, // Defina como true para ocultar players de áudio e vídeo
      "custom_srt_lang": "PT", // Código do idioma da legenda para personalizado .vtt language.
      "disable_video_download": false, // Remover Download, Botão Copiar em Vídeos
      "second_domain_for_dl": false, // Se você deseja exibir outro URL para download para proteger seu domínio principal.
      "downloaddomain": domain_for_dl, // Ignore isso e defina os domínios no topo desta página após as contas de serviço.
      "videodomain": video_domain_for_dl, // Ignore isso e defina os domínios na parte superior desta página após as contas de serviço.
      "poster": "https://i.imgur.com/0woeptN.png", // Poster para vídeos, altere para um de sua preferencia, ou dê crédito ao Samuca
      "audioposter": "https://cdn.jsdelivr.net/npm/@googledrive/index@2.0.20/images/music.jpg", // Poster para áudios
      "jsdelivr_cdn_src": "https://cdn.jsdelivr.net/npm/@googledrive/index", // Mantenha exatamente como está
      "render_head_md": true, // Render Head.md
      "render_readme_md": true, // Render Readme.md
      "display_drive_link": false, // Altamente desaconselhavel colocar como true.
      "plyr_io_version": "3.7.2", // Não altere, a menos que saiba do que se trate.
      "plyr_io_video_resolution": "16:9", // Resolução de vídeo, consulte: https://github.com/sampotts/plyr#options
      "unauthorized_owner_link": "https://site.my.eu.org/", // Link de página de erro não autorizado para o proprietário
      "unauthorized_owner_email": "contato@site.my.eu.org", // E-mail não autorizado do proprietário da página de erro
  };
  
  
  /* NÃO EDITE NADA ABAIXO*/
  /* NÃO EDITE NADA ABAIXO*/
  /* NÃO EDITE NADA ABAIXO*/
  /* NÃO EDITE NADA ABAIXO*/
  
  // NÃO EDITE NADA ABAIXO A NÃO SER QUE VOCÊ SAIBA O QUE ESTÁ FAZENDO
  
  var gds = [];
  
  function html(current_drive_order = 0, model = {}) {
      return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no"/>
    <title>${authConfig.siteName}</title>
    <script async src="https://arc.io/widget.min.js#${uiConfig.arc_code}"></script>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="${uiConfig.favicon}">
    <script>
      window.drive_names = JSON.parse('${JSON.stringify(authConfig.roots.map(it => it.name))}');
      window.MODEL = JSON.parse('${JSON.stringify(model)}');
      window.current_drive_order = ${current_drive_order};
      window.UI = JSON.parse('${JSON.stringify(uiConfig)}');
    </script>
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
    <link rel="stylesheet" href="https://cdn.plyr.io/${uiConfig.plyr_io_version}/plyr.css" />
    <link href="https://cdn.jsdelivr.net/npm/bootswatch@5.0.0/dist/${uiConfig.theme}/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <style>a{color:${uiConfig.css_a_tag_color};}p{color:${uiConfig.css_p_tag_color};}</style>
    <script src="${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/js/app.obf.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/build/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked@4.0.0/marked.min.js"></script>
  </head>
  <body>
  </body>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>
    <script src="https://cdn.plyr.io/${uiConfig.plyr_io_version}/plyr.polyfilled.js"></script>
  </html>`;
  };
  
  const homepage = `<!DOCTYPE html>
  <html>
     <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no">
        <title>${authConfig.siteName}</title>
        <meta name="robots" content="noindex">
        <link rel="icon" href="${uiConfig.favicon}">
        <script>
            window.drive_names = JSON.parse('${JSON.stringify(authConfig.roots.map(it => it.name))}');
            window.UI = JSON.parse('${JSON.stringify(uiConfig)}');
        </script>
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
        <link rel="stylesheet" href="https://cdn.plyr.io/${uiConfig.plyr_io_version}/plyr.css" />
        <link href="https://cdn.jsdelivr.net/npm/bootswatch@5.0.0/dist/${uiConfig.theme}/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
        <style>a{color:${uiConfig.css_a_tag_color};}p{color:${uiConfig.css_p_tag_color};}</style>
     </head>
     <body>
        <header>
           <div id="nav">
              <nav class="navbar navbar-expand-lg${uiConfig.fixed_header ?' fixed-top': ''} ${uiConfig.header_style_class}">
                 <div class="container-fluid">
                   <a class="navbar-brand" href="/">${uiConfig.logo_image ? '<img border="0" alt="'+uiConfig.company_name+'" src="'+uiConfig.logo_link_name+'" height="'+uiConfig.height+'" width="'+uiConfig.logo_width+'">' : uiConfig.logo_link_name}</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                       <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                          <li class="nav-item">
                            <a class="nav-link" href="/">${uiConfig.nav_link_1}</a>
                          </li>
                          <li class="nav-item dropdown">
                             <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Pasta Atual</a>
                             <div class="dropdown-menu" aria-labelledby="navbarDropdown"><a class="dropdown-item" href="/">&gt; ${uiConfig.nav_link_1}</a></div>
                          </li>
                          <li class="nav-item">
                             <a class="nav-link" href="${uiConfig.contact_link}" target="_blank">${uiConfig.nav_link_4}</a>
                          </li>
                          ${uiConfig.show_logout_button ?'<li class="nav-item"><a class="nav-link" href="/logout">Sair</a></li>': ''}
                       </ul>
                       <form class="d-flex" method="get" action="/0:search">
                          <input class="form-control me-2" name="q" type="search" placeholder="Procurar" aria-label="Procurar" value="" required="">
                          <button class="btn btn btn-danger" onclick="if($('#search_bar_form>input').val()) $('#search_bar_form').submit();" type="submit">Enviar</button>
                       </form>
                    </div>
                 </div>
              </nav>
           </div>
        </header>
        <div>
           <div id="content" style="padding-top: ${uiConfig.header_padding}px;">
              <div class="container">
                 <div class="alert alert-primary d-flex align-items-center" role="alert" style="margin-bottom: 0; padding-bottom: 0rem;">
                    <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
                       <ol class="breadcrumb" id="folderne">
                          <li class="breadcrumb-item"><a href="/">Home</a></li>
                       </ol>
                    </nav>
                 </div>
                 <div id="list" class="list-group text-break">
  
                 </div>
                 <div class="${uiConfig.file_count_alert_class} text-center" role="alert" id="count">Total <span id="n_drives" class="number text-center"></span> drives</div>
              </div>
           </div>
           <div class="modal fade" id="SearchModel" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="SearchModelLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                 <div class="modal-content">
                    <div class="modal-header">
                       <h5 class="modal-title" id="SearchModelLabel"></h5>
                       <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                       <span aria-hidden="true"></span>
                       </button>
                    </div>
                    <div class="modal-body" id="modal-body-space">
                    </div>
                    <div class="modal-footer" id="modal-body-space-buttons">
                    </div>
                 </div>
              </div>
           </div>
           <br>
           <footer class="footer mt-auto py-3 text-muted ${uiConfig.footer_style_class}" style="${uiConfig.fixed_footer ?'position: fixed; ': ''}left: 0; bottom: 0; width: 100%; color: white; z-index: 9999;${uiConfig.hide_footer ? ' display:none;': ' display:block;'}"> <div class="container" style="width: auto; padding: 0 10px;"> <p class="float-end"> <a href="#">Back to top</a> </p> ${uiConfig.credit ? '<p>Redesigned with <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-heart-fill" fill="red" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z" /> </svg> by <a href="https://www.npmjs.com/package/@googledrive/index" target="_blank">TheFirstSpeedster</a>, based on Open Source Softwares.</p>' : ''} <p>© ${uiConfig.copyright_year} - <a href=" ${uiConfig.company_link}" target="_blank"> ${uiConfig.company_name}</a>, All Rights Reserved.</p> </div> </footer>
        </div>
     </body>
    <script src="${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/homepage.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-p34f1UUtsS3wqzfto5wAAmdvj+osOnFyQFpp4Ua3gs/ZVWx6oOypYoCJhGGScy+8" crossorigin="anonymous"></script>
  </html>`
  
  const unauthorized = `<html>
     <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>Sign in - ${authConfig.siteName}</title>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <meta name="robots" content="noindex, nofollow">
        <meta name="googlebot" content="noindex, nofollow">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="${uiConfig.favicon}">
        <script type="text/javascript" src="//code.jquery.com/jquery-3.3.1.slim.min.js"></script>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
        <style id="compiled-css" type="text/css">.login,.image{min-height:100vh}.bg-image{background-image:url('https://i.imgur.com/cdRGqw7.jpg');background-size:cover;background-position:center center}#error-message{display:none}</style>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Palette+Mosaic&display=swap" rel="stylesheet">
        <style>
           .logo {
           font-family: 'Orbitron', sans-serif;
           color: #007bff;
           }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
        <script>
           $(document).ready(function()
           {
             $('form').submit(function()
             {
               var username = $('#email').val();
               var password = $('#password').val();
  
               $.ajax(
                 {
                   'password' : password,
                   'username' : username,
                   'url'      : '',
                   'type'     : 'GET',
                   'success'  : function(){ window.location = ''; },
                   'error'    : function(){document.getElementById('error').innerHTML = 'Invalid Login Details, Retry or Contact Admin.';},
                 }
               );
  
               return false;
             });
           });
        </script>
     </head>
     <body>
        <div class="container-fluid">
           <div class="row no-gutter">
              <div class="col-md-6 d-none d-md-flex bg-image"></div>
              <div class="col-md-6 bg-light">
                 <div class="login d-flex align-items-center py-5">
                    <div class="container">
                       <div class="row">
                          <div class="col-lg-10 col-xl-7 mx-auto">
                             <h3 class="logo">${authConfig.siteName}</h3>
                             <p class="text-muted mb-4">Requer Bom Senso...</p>
                             <div id="error-message" class="alert alert-danger"></div>
                             <form onsubmit="return false;" method="post">
                                  <p id="error" style="color:red;"></p>
                                <div class="form-group mb-3">
                                   <input id="email" type="text" placeholder="E-mail" autofocus="" class="form-control rounded-pill border-0 shadow-sm px-4" required>
                                </div>
                                <div class="form-group mb-3">
                                   <input id="password" type="password" placeholder="Senha" class="form-control rounded-pill border-0 shadow-sm px-4 text-primary" required>
                                </div>
                                <button id="btn-login" type="submit" class="btn btn-primary btn-block text-uppercase mb-2 rounded-pill shadow-sm">Entrar</button>
                                <hr class="solid">
                                <center>
                                   <p id="hidereset">
                                      <marquee>Nenhum processo de inscrição disponível, entre em contato com seu administrador para obter ID e senha em contato@site.my.eu.org</marquee>
                                   </p>
                                </center>
                             </form>
                          </div>
                       </div>
                    </div>
                 </div>
                 <center>
                    <p>
                       &copy; <script>document.write(new Date().getFullYear())</script> ${uiConfig.company_name}
                    </p>
                 </center>
              </div>
           </div>
        </div>
     </body>
  </html>`
  
  const not_found = `<!DOCTYPE html>
  <html lang=en>
    <meta charset=utf-8>
    <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">
    <title>Error 404 (Not Found)!!1</title>
    <style>
      *{margin:0;padding:0}html,code{font:15px/22px arial,sans-serif}html{background:#fff;color:#222;padding:15px}body{margin:7% auto 0;max-width:390px;min-height:180px;padding:30px 0 15px}* > body{background:url(//www.google.com/images/errors/robot.png) 100% 5px no-repeat;padding-right:205px}p{margin:11px 0 22px;overflow:hidden}ins{color:#777;text-decoration:none}a img{border:0}@media screen and (max-width:772px){body{background:none;margin-top:0;max-width:none;padding-right:0}}#logo{background:url(//www.google.com/images/branding/googlelogo/1x/googlelogo_color_150x54dp.png) no-repeat;margin-left:-5px}@media only screen and (min-resolution:192dpi){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat 0% 0%/100% 100%;-moz-border-image:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) 0}}@media only screen and (-webkit-min-device-pixel-ratio:2){#logo{background:url(//www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png) no-repeat;-webkit-background-size:100% 100%}}#logo{display:inline-block;height:54px;width:150px}
    </style>
    <a href=//www.google.com/><span id=logo aria-label=Google></span></a>
    <p><b>404.</b> <ins>That’s an error.</ins>
    <p id="status"></p>
  
    <script>
    document.getElementById("status").innerHTML =
  "The requested URL <code>" + window.location.pathname + "</code> was not found on this server.  <ins>That’s all we know.</ins>";
    </script>`
  
    const asn_blocked = `<html>
    <head>
    <title>Access Denied</title>
    <link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
    <style>
    body{
        margin:0;
        padding:0;
        width:100%;
        height:100%;
        color:#b0bec5;
        display:table;
        font-weight:100;
        font-family:Lato
    }
    .container{
        text-align:center;
        display:table-cell;
        vertical-align:middle
    }
    .content{
        text-align:center;
        display:inline-block
    }
    .message{
        font-size:80px;
        margin-bottom:40px
    }
    a{
        text-decoration:none;
        color:#3498db
    }
  
    </style>
    </head>
    <body>
    <div class="container">
    <div class="content">
    <div class="message">Access Denied</div>
    </div>
    </div>
    </body>
    </html>`
  
    const directlink = `
    <html>
    <head>
    <title>Direct Link - Access Denied</title>
    <link href='https://fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
    <style>
    body{
        margin:0;
        padding:0;
        width:100%;
        height:100%;
        color:#b0bec5;
        display:table;
        font-weight:100;
        font-family:Lato
    }
    .container{
        text-align:center;
        display:table-cell;
        vertical-align:middle
    }
    .content{
        text-align:center;
        display:inline-block
    }
    .message{
        font-size:80px;
        margin-bottom:40px
    }
    a{
        text-decoration:none;
        color:#3498db
    }
  
    </style>
    </head>
    <body>
    <div class="container">
    <div class="content">
    <div class="message">Access Denied</div>
    <center><a href=""><button id="goto">Click Here to Proceed!</button></a></center>
    </div>
    </div>
    </body>
    </html>
    `
  
  const SearchFunction = {
      formatSearchKeyword: function(keyword) {
          let nothing = "";
          let space = " ";
          if (!keyword) return nothing;
          return keyword.replace(/(!=)|['"=<>/\\:]/g, nothing)
              .replace(/[,，|(){}]/g, space)
              .trim()
      }
  
  };
  
  const DriveFixedTerms = new(class {
      default_file_fields = 'parents,id,name,mimeType,modifiedTime,createdTime,fileExtension,size';
      gd_root_type = {
          user_drive: 0,
          share_drive: 1
      };
      folder_mime_type = 'application/vnd.google-apps.folder';
  })();
  
  const JSONWebToken = {
      header: {
          alg: 'RS256',
          typ: 'JWT'
      },
      importKey: async function(pemKey) {
          var pemDER = this.textUtils.base64ToArrayBuffer(pemKey.split('\n').map(s => s.trim()).filter(l => l.length && !l.startsWith('---')).join(''));
          return crypto.subtle.importKey('pkcs8', pemDER, {
              name: 'RSASSA-PKCS1-v1_5',
              hash: 'SHA-256'
          }, false, ['sign']);
      },
      createSignature: async function(text, key) {
          const textBuffer = this.textUtils.stringToArrayBuffer(text);
          return crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, textBuffer)
      },
      generateGCPToken: async function(serviceAccount) {
          const iat = parseInt(Date.now() / 1000);
          var payload = {
              "iss": serviceAccount.client_email,
              "scope": "https://www.googleapis.com/auth/drive",
              "aud": "https://oauth2.googleapis.com/token",
              "exp": iat + 3600,
              "iat": iat
          };
          const encPayload = btoa(JSON.stringify(payload));
          const encHeader = btoa(JSON.stringify(this.header));
          var key = await this.importKey(serviceAccount.private_key);
          var signed = await this.createSignature(encHeader + "." + encPayload, key);
          return encHeader + "." + encPayload + "." + this.textUtils.arrayBufferToBase64(signed).replace(/\//g, '_').replace(/\+/g, '-');
      },
      textUtils: {
          base64ToArrayBuffer: function(base64) {
              var binary_string = atob(base64);
              var len = binary_string.length;
              var bytes = new Uint8Array(len);
              for (var i = 0; i < len; i++) {
                  bytes[i] = binary_string.charCodeAt(i);
              }
              return bytes.buffer;
          },
          stringToArrayBuffer: function(str) {
              var len = str.length;
              var bytes = new Uint8Array(len);
              for (var i = 0; i < len; i++) {
                  bytes[i] = str.charCodeAt(i);
              }
              return bytes.buffer;
          },
          arrayBufferToBase64: function(buffer) {
              let binary = '';
              let bytes = new Uint8Array(buffer);
              let len = bytes.byteLength;
              for (let i = 0; i < len; i++) {
                  binary += String.fromCharCode(bytes[i]);
              }
              return btoa(binary);
          }
      }
  };
  
  // auth0.com functions
  const AUTH0_DOMAIN  = auth0.domain
  const AUTH0_CLIENT_ID  = auth0.clientId
  const AUTH0_CLIENT_SECRET = auth0.clientSecret
  const AUTH0_CALLBACK_URL = auth0.callbackUrl
  const AUTH0_LOGOUT_URL = auth0.logoutUrl
  const SALT = `keys565`
  
  const cookieKey = 'AUTH0-AUTH'
  
  const generateStateParam = async () => {
    if(authConfig['enable_auth0_com']){
      const resp = await fetch('https://csprng.xyz/v1/api')
      const { Data: state } = await resp.json()
      await AUTH_STORE.put(`state-${state}`, true, { expirationTtl: 60 })
      return state
    }
  }
  
  const exchangeCode = async code => {
    const body = JSON.stringify({
      grant_type: 'authorization_code',
      client_id: auth0.clientId,
      client_secret: auth0.clientSecret,
      code,
      redirect_uri: auth0.callbackUrl,
    })
  
    return persistAuth(
      await fetch(AUTH0_DOMAIN  + '/oauth/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      }),
    )
  }
  
  // https://github.com/pose/webcrypto-jwt/blob/master/index.js
  const decodeJWT = function(token) {
    var output = token
      .split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    switch (output.length % 4) {
      case 0:
        break
      case 2:
        output += '=='
        break
      case 3:
        output += '='
        break
      default:
        throw 'Illegal base64url string!'
    }
  
    const result = atob(output)
  
    try {
      return decodeURIComponent(escape(result))
    } catch (err) {
      console.log(err)
      return result
    }
  }
  
  const validateToken = token => {
    try {
      const dateInSecs = d => Math.ceil(Number(d) / 1000)
      const date = new Date()
  
      let iss = token.iss
  
      // ISS can include a trailing slash but should otherwise be identical to
      // the AUTH0_DOMAIN, so we should remove the trailing slash if it exists
      iss = iss.endsWith('/') ? iss.slice(0, -1) : iss
  
      if (iss !== AUTH0_DOMAIN) {
        throw new Error(
          `Token iss value (${iss}) doesn't match AUTH0_DOMAIN (${AUTH0_DOMAIN})`,
        )
      }
  
      if (token.aud !== AUTH0_CLIENT_ID) {
        throw new Error(
          `Token aud value (${token.aud}) doesn't match AUTH0_CLIENT_ID (${AUTH0_CLIENT_ID})`,
        )
      }
  
      if (token.exp < dateInSecs(date)) {
        throw new Error(`Token exp value is before current time`)
      }
  
      // Token should have been issued within the last day
      date.setDate(date.getDate() - 1)
      if (token.iat < dateInSecs(date)) {
        throw new Error(`Token was issued before one day ago and is now invalid`)
      }
  
      return true
    } catch (err) {
      console.log(err.message)
      return false
    }
  }
  
  const persistAuth = async exchange => {
    const body = await exchange.json()
  
    if (body.error) {
      throw new Error(body.error)
    }
  
    const date = new Date()
    date.setDate(date.getDate() + 1)
  
    const decoded = JSON.parse(decodeJWT(body.id_token))
    const validToken = validateToken(decoded)
    if (!validToken) {
      return { status: 401 }
    }
  
    const text = new TextEncoder().encode(`${SALT}-${decoded.sub}`)
    const digest = await crypto.subtle.digest({ name: 'SHA-256' }, text)
    const digestArray = new Uint8Array(digest)
    const id = btoa(String.fromCharCode.apply(null, digestArray))
  
    await AUTH_STORE.put(id, JSON.stringify(body))
  
    const headers = {
      Location: '/',
      'Set-cookie': `${cookieKey}=${id}; Secure; HttpOnly; SameSite=Lax; Expires=${date.toUTCString()}`,
    }
  
    return { headers, status: 302 }
  }
  
  const redirectUrl = state =>
    `${auth0.domain}/authorize?response_type=code&client_id=${
      auth0.clientId
    }&redirect_uri=${
      auth0.callbackUrl
    }&scope=openid%20profile%20email&state=${encodeURIComponent(state)}`
  
  const handleRedirect = async event => {
    const url = new URL(event.request.url)
  
    const state = url.searchParams.get('state')
    if (!state) {
      return null
    }
  
    const storedState = await AUTH_STORE.get(`state-${state}`)
    if (!storedState) {
      return null
    }
  
    const code = url.searchParams.get('code')
    if (code) {
      return exchangeCode(code)
    }
  
    return null
  }
  
  function getCookie(cookie,name) {
      var nameEQ = name + "=";
      var ca = cookie.split(';');
      for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
      }
      return null;
  }
  
  async function getAssetFromKV(event){
    return null
  }
  const verify = async event => {
    const cookieHeader = event.request.headers.get('Cookie')
  
    if (cookieHeader && cookieHeader.includes(cookieKey)) {
      // cookieHeader.includes(cookieKey)
      // throw new Error(getCookie(cookieHeader,cookieKey))
      // const cookies = cookie.parse(cookieHeader)
      if (!getCookie(cookieHeader,cookieKey)) return {}
      const sub = getCookie(cookieHeader,cookieKey)
  
      const kvData = await AUTH_STORE.get(sub)
      if (!kvData) {
        return {}
        //throw new Error('Unable to find authorization data')
      }
  
      let kvStored
      try {
        kvStored = JSON.parse(kvData)
      } catch (err) {
        throw new Error('Unable to parse auth information from Workers KV')
      }
  
      const { access_token: accessToken, id_token: idToken } = kvStored
      const userInfo = JSON.parse(decodeJWT(idToken))
      return { accessToken, idToken, userInfo }
    }
    return {}
  }
  
  const authorize = async event => {
    const authorization = await verify(event)
    if (authorization.accessToken) {
      return [true, { authorization }]
    } else {
      const state = await generateStateParam()
      return [false, { redirectUrl: redirectUrl(state) }]
    }
  }
  
  // const logout = event => {
  //   const cookieHeader = event.request.headers.get('Cookie')
  //   if (cookieHeader && cookieHeader.includes(cookieKey)) {
  //     return {
  //       headers: {
  //         'Set-cookie': `${cookieKey}=""; HttpOnly; Secure; SameSite=Lax;`,
  //       },
  //     }
  //   }
  //   return {}
  // }
  
  const hydrateState = (state = {}) => ({
    element: el => {
      el.setInnerContent(JSON.stringify(state))
    },
  })
  
  
  // addEventListener('fetch', event => event.respondWith(handleRequest(event)))
  
  // see the readme for more info on what these config options do!
  const config = {
    // opt into automatic authorization state hydration
    hydrateState: true,
    // return responses at the edge
    originless: true,
  }
  
  async function loginHandleRequest(event) {
    try {
      let request = event.request
  
      const [authorized, { authorization, redirectUrl }] = await authorize(event)
  
      const url = new URL(event.request.url)
      if (url.pathname === '/auth') {
        const authorizedResponse = await handleRedirect(event)
        if (!authorizedResponse) {
          let redirectHeaders = new Headers()
          redirectHeaders.set('Refresh', `1; url=${auth0.logoutUrl}`)
          redirectHeaders.set('Set-cookie', `${cookieKey}=""; HttpOnly; Secure; SameSite=Lax;`)
          return new Response('Unauthorized - Redirecting', { status: 302, headers: redirectHeaders })
  
        }
        response = new Response(request.body, {
          request,
          ...authorizedResponse,
        })
        return response
      }
  
      if (!authorized) {
        return Response.redirect(redirectUrl)
      }
  
      if (url.pathname === '/logout') {
  
        let redirectHeaders = new Headers()
        redirectHeaders.set('Location', `${auth0.domain}/v2/logout?client_id=${auth0.clientId}&returnTo=${auth0.logoutUrl}`)
        redirectHeaders.set('Set-cookie', `${cookieKey}=""; HttpOnly; Secure; SameSite=Lax;`)
  
        return new Response('', {
            status: 302,
            headers: redirectHeaders
          })
      }
  
      return null
  
    } catch (err) {
      return new Response(err.toString())
    }
  }
  //end auth0.com function
  
  addEventListener('fetch', event => {
      event.respondWith(handleRequest(event.request, event));
  });
  
  async function handleRequest(request, event) {
      var loginCheck = await loginHandleRequest(event)
      if(authConfig['enable_auth0_com'] && loginCheck != null){return loginCheck}
      const region = request.headers.get('cf-ipcountry').toUpperCase();
      const asn_servers = request.cf.asn;
      const referer = request.headers.get("Referer");
      if (gds.length === 0) {
          for (let i = 0; i < authConfig.roots.length; i++) {
              const gd = new googleDrive(authConfig, i);
              await gd.init();
              gds.push(gd)
          }
          let tasks = [];
          gds.forEach(gd => {
              tasks.push(gd.initRootType());
          });
          for (let task of tasks) {
              await task;
          }
      }
  
      let gd;
      let url = new URL(request.url);
      let path = url.pathname;
      let hostname = url.hostname;
  
      function redirectToIndexPage() {
          return new Response('', {
              status: 307,
              headers: {
                  'Location': `${url.origin}/0:/`
              }
          });
      }
  
      if (path == '/') {
          return new Response(homepage, {
              status: 200,
              headers: {
                  "content-type": "text/html;charset=UTF-8",
              },
          })
      }
      if (path.toLowerCase() == '/arc-sw.js') {
          return fetch("https://arc.io/arc-sw.js")
      } else if (path.toLowerCase() == '/admin') {
          return Response.redirect("https://www.npmjs.com/package/@googledrive/index", 301)
      } else if (blocked_region.includes(region)) {
          return new Response(asn_blocked, {
              status: 403,
              headers: {
                  "content-type": "text/html;charset=UTF-8",
              },
          })
      } else if (blocked_asn.includes(asn_servers)) {
          return new Response(asn_blocked, {
                  headers: {
                      'content-type': 'text/html;charset=UTF-8'
                  },
                  status: 401
              });
      }
  
      if (authConfig['direct_link_protection']) {
        if (referer == null){
            return new Response(directlink, {
                    headers: {
                        'content-type': 'text/html;charset=UTF-8'
                    },
                    status: 401
                });
            console.log("Refer Null");
        } else if (referer.includes(hostname)) {
            console.log("Refer Detected");
        } else {
            return new Response(directlink, {
                    headers: {
                        'content-type': 'text/html;charset=UTF-8'
                    },
                    status: 401
                });
            console.log("Wrong Refer URL");
        }
      }
  
      const command_reg = /^\/(?<num>\d+):(?<command>[a-zA-Z0-9]+)(\/.*)?$/g;
      const match = command_reg.exec(path);
      if (match) {
          const num = match.groups.num;
          const order = Number(num);
          if (order >= 0 && order < gds.length) {
              gd = gds[order];
          } else {
              return redirectToIndexPage()
          }
          for (const r = gd.basicAuthResponse(request); r;) return r;
          const command = match.groups.command;
          if (command === 'search') {
              if (request.method === 'POST') {
                  return handleSearch(request, gd);
              } else {
                  const params = url.searchParams;
                  return new Response(html(gd.order, {
                      q: params.get("q").replace(/'/g, "").replace(/"/g, "") || '',
                      is_search_page: true,
                      root_type: gd.root_type
                  }), {
                      status: 200,
                      headers: {
                          'Content-Type': 'text/html; charset=utf-8'
                      }
                  });
              }
          } else if (command === 'id2path' && request.method === 'POST') {
              return handleId2Path(request, gd)
          }
      }
  
      const common_reg = /^\/\d+:\/.*$/g;
      try {
          if (!path.match(common_reg)) {
              return redirectToIndexPage();
          }
          let split = path.split("/");
          let order = Number(split[1].slice(0, -1));
          if (order >= 0 && order < gds.length) {
              gd = gds[order];
          } else {
              return redirectToIndexPage()
          }
      } catch (e) {
          return redirectToIndexPage()
      }
  
      const basic_auth_res = gd.basicAuthResponse(request);
  
      path = path.replace(gd.url_path_prefix, '') || '/';
      if (request.method == 'POST') {
          return basic_auth_res || apiRequest(request, gd);
      }
  
      let action = url.searchParams.get('a');
  
      if (path.substr(-1) == '/' || action != null) {
          return basic_auth_res || new Response(html(gd.order, {
              root_type: gd.root_type
          }), {
              status: 200,
              headers: {
                  'Content-Type': 'text/html; charset=utf-8'
              }
          });
      } else {
        try {
        if (path.split('/').pop().toLowerCase() == ".password") {
            return basic_auth_res || new Response("", {
                status: 404
            });
        }
        let file = await gd.file(path);
        let range = request.headers.get('Range');
        const inline_down = 'true' === url.searchParams.get('inline');
        if (gd.root.protect_file_link && basic_auth_res) return basic_auth_res;
        return gd.down(file?.id, range, inline_down);
        }
        catch {
                return new Response(not_found, {
                    status: 404,
                    headers: {
                        "content-type": "text/html;charset=UTF-8",
                    },
                })
        }
  
      }
  }
  
  function gdiencode(str) {
      var gdijsorg_0x40df = ['1KzJBAK', '1697708zMrtEu', '295396TasIvj', '21011Eyuayv', '1217593CxovUD', 'fromCharCode', '143062xekFCR', 'replace', '74bcHwvq', '73939wlqHSM', '2CBdqkc', '1712527AcNPoP'];
      var gdijsorg_0x5556bb = gdijsorg_0x56b1;
      (function(_0x3f3911, _0x38bce9) {
          var _0x32440e = gdijsorg_0x56b1;
          while (!![]) {
              try {
                  var _0x2cab6f = -parseInt(_0x32440e(0xb3)) + -parseInt(_0x32440e(0xb7)) * -parseInt(_0x32440e(0xb6)) + -parseInt(_0x32440e(0xaf)) * -parseInt(_0x32440e(0xad)) + -parseInt(_0x32440e(0xb1)) + parseInt(_0x32440e(0xae)) + parseInt(_0x32440e(0xac)) + parseInt(_0x32440e(0xb0)) * -parseInt(_0x32440e(0xb5));
                  if (_0x2cab6f === _0x38bce9) break;
                  else _0x3f3911['push'](_0x3f3911['shift']());
              } catch (_0x34d506) {
                  _0x3f3911['push'](_0x3f3911['shift']());
              }
          }
      }(gdijsorg_0x40df, 0xe5038));
  
      function gdijsorg_0x56b1(_0x1ccc20, _0x1596c4) {
          _0x1ccc20 = _0x1ccc20 - 0xac;
          var _0x40df0f = gdijsorg_0x40df[_0x1ccc20];
          return _0x40df0f;
      }
      return btoa(encodeURIComponent(str)[gdijsorg_0x5556bb(0xb4)](/%([0-9A-F]{2})/g, function toSolidBytes(_0xe8cc7f, _0x12410f) {
          var _0x1cce23 = gdijsorg_0x5556bb;
          return String[_0x1cce23(0xb2)]('0x' + _0x12410f);
      }));
  }
  
  async function apiRequest(request, gd) {
      let url = new URL(request.url);
      let path = url.pathname;
      path = path.replace(gd.url_path_prefix, '') || '/';
  
      let option = {
          status: 200,
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      }
  
      if (path.substr(-1) == '/') {
          let form = await request.formData();
          let deferred_list_result = gd.list(path, form.get('page_token'), Number(form.get('page_index')));
  
          if (authConfig['enable_password_file_verify']) {
              let password = await gd.password(path);
              // console.log("dir password", password);
              if (password && password.replace("\n", "") !== form.get('password')) {
                  let html = `Y29kZWlzcHJvdGVjdGVk=0Xfi4icvJnclBCZy92dzNXYwJCI6ISZnF2czVWbiwSMwQDI6ISZk92YisHI6IicvJnclJyeYmFzZTY0aXNleGNsdWRlZA==`;
                  return new Response(html, option);
              }
          }
  
          let list_result = await deferred_list_result;
          return new Response(rewrite(gdiencode(JSON.stringify(list_result), option)));
      } else {
          let file = await gd.file(path);
          let range = request.headers.get('Range');
          return new Response(rewrite(gdiencode(JSON.stringify(file))));
      }
  }
  
  // deal with search
  async function handleSearch(request, gd) {
      const option = {
          status: 200,
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      };
      let form = await request.formData();
      let search_result = await
      gd.search(form.get('q') || '', form.get('page_token'), Number(form.get('page_index')));
      return new Response(rewrite(gdiencode(JSON.stringify(search_result), option)));
  }
  
  async function handleId2Path(request, gd) {
      const option = {
          status: 200,
          headers: {
              'Access-Control-Allow-Origin': '*'
          }
      };
      let form = await request.formData();
      let path = await gd.findPathById(form.get('id'));
      return new Response(path || '', option);
  }
  
  class googleDrive {
      constructor(authConfig, order) {
          this.order = order;
          this.root = authConfig.roots[order];
          this.root.protect_file_link = this.root.protect_file_link || false;
          this.url_path_prefix = `/${order}:`;
          this.authConfig = authConfig;
          this.paths = [];
          this.files = [];
          this.passwords = [];
          this.id_path_cache = {};
          this.id_path_cache[this.root['id']] = '/';
          this.paths["/"] = this.root['id'];
      }
      async init() {
          await this.accessToken();
          if (authConfig.user_drive_real_root_id) return;
          const root_obj = await (gds[0] || this).findItemById('root');
          if (root_obj && root_obj.id) {
              authConfig.user_drive_real_root_id = root_obj.id
          }
      }
  
      async initRootType() {
          const root_id = this.root['id'];
          const types = DriveFixedTerms.gd_root_type;
          if (root_id === 'root' || root_id === authConfig.user_drive_real_root_id) {
              this.root_type = types.user_drive;
          } else {
              this.root_type = types.share_drive;
          }
      }
  
      basicAuthResponse(request) {
          let url = new URL(request.url);
          let path = url.pathname;
          const auth = this.root.auth || '',
              _401 = new Response(unauthorized, {
                  headers: {
                      'WWW-Authenticate': `Basic realm="goindex:drive:${this.order}"`,
                      'content-type': 'text/html;charset=UTF-8'
                  },
                  status: 401
              });
          if (authConfig['lock_folders']) {
              if (auth && path.endsWith("/") || path.endsWith("search")) {
                  const _auth = request.headers.get('Authorization')
                  if (_auth) {
                      const [received_user, received_pass] = atob(_auth.split(' ').pop()).split(':');
                      if (auth.hasOwnProperty(received_user)) {
                          if (auth[received_user] == received_pass) {
                              return null;
                          } else return _401;
                      } else return _401;
                  }
              } else return null;
          } else {
                  if (auth) {
                      const _auth = request.headers.get('Authorization')
                      if (_auth) {
                          const [received_user, received_pass] = atob(_auth.split(' ').pop()).split(':');
                          if (auth.hasOwnProperty(received_user)) {
                              if (auth[received_user] == received_pass) {
                                  return null;
                              } else return _401;
                          } else return _401;
                      }
                  } else return null;
          }
          return _401;
      }
  
      async down(id, range = '', inline = false) {
          let url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
          let requestOption = await this.requestOption();
          requestOption.headers['Range'] = range;
          let res;
           for (let i = 0; i < 3; i++) {
               res = await fetch(url, requestOption);
               if (res.status === 200) {
                   break;
               }
               await this.sleep(800 * (i + 1));
               console.log(res);
           }
          const second_domain_for_dl = `${uiConfig.second_domain_for_dl}`
          if (second_domain_for_dl == 'true') {
              const res = await fetch(`${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/disable_download.html`);
              return new Response(await res.text(), {
                  headers: {
                      "content-type": "text/html;charset=UTF-8",
                  },
              })
          }
          else if (res.ok) {
              const {
                  headers
              } = res = new Response(res.body, res)
              this.authConfig.enable_cors_file_down && headers.append('Access-Control-Allow-Origin', '*');
              inline === true && headers.set('Content-Disposition', 'inline');
              return res;
          }
          else if(res.status == 404){
              return new Response(not_found, {
                  status: 404,
                  headers: {
                      "content-type": "text/html;charset=UTF-8",
                  },
              })
          }
          else {
              const res = await fetch(`${uiConfig.jsdelivr_cdn_src}@${uiConfig.version}/assets/download_error.html`);
              return new Response(await res.text(), {
                  headers: {
                      "content-type": "text/html;charset=UTF-8",
                  },
              })
          }
      }
  
      async file(path) {
          if (typeof this.files[path] == 'undefined') {
              this.files[path] = await this._file(path);
          }
          return this.files[path];
      }
  
      async _file(path) {
          let arr = path.split('/');
          let name = arr.pop();
          name = decodeURIComponent(name).replace(/\'/g, "\\'");
          let dir = arr.join('/') + '/';
          // console.log(name, dir);
          let parent = await this.findPathId(dir);
          // console.log(parent);
          let url = 'https://www.googleapis.com/drive/v3/files';
          let params = {
              'includeItemsFromAllDrives': true,
              'supportsAllDrives': true
          };
          params.q = `'${parent}' in parents and name = '${name}' and trashed = false and mimeType != 'application/vnd.google-apps.shortcut'`;
          params.fields = "files(id, name, mimeType, size ,createdTime, modifiedTime, iconLink, thumbnailLink)";
          url += '?' + this.enQuery(params);
          let requestOption = await this.requestOption();
          let response;
          for (let i = 0; i < 3; i++) {
              response = await fetch(url, requestOption);
              if (response.status === 200) {
                  break;
              }
              await this.sleep(800 * (i + 1));
          }
          let obj = await response.json();
          // console.log(obj);
          return obj.files[0];
      }
  
      async list(path, page_token = null, page_index = 0) {
          if (this.path_children_cache == undefined) {
              // { <path> :[ {nextPageToken:'',data:{}}, {nextPageToken:'',data:{}} ...], ...}
              this.path_children_cache = {};
          }
  
          if (this.path_children_cache[path] &&
              this.path_children_cache[path][page_index] &&
              this.path_children_cache[path][page_index].data
          ) {
              let child_obj = this.path_children_cache[path][page_index];
              return {
                  nextPageToken: child_obj.nextPageToken || null,
                  curPageIndex: page_index,
                  data: child_obj.data
              };
          }
  
          let id = await this.findPathId(path);
          let result = await this._ls(id, page_token, page_index);
          let data = result.data;
          if (result.nextPageToken && data.files) {
              if (!Array.isArray(this.path_children_cache[path])) {
                  this.path_children_cache[path] = []
              }
              this.path_children_cache[path][Number(result.curPageIndex)] = {
                  nextPageToken: result.nextPageToken,
                  data: data
              };
          }
  
          return result
      }
  
  
      async _ls(parent, page_token = null, page_index = 0) {
  
          if (parent == undefined) {
              return null;
          }
          let obj;
          let params = {
              'includeItemsFromAllDrives': true,
              'supportsAllDrives': true
          };
          params.q = `'${parent}' in parents and trashed = false AND name !='.password' and mimeType != 'application/vnd.google-apps.shortcut'`;
          params.orderBy = 'folder,name,modifiedTime desc';
          params.fields = "nextPageToken, files(id, name, mimeType, size , modifiedTime)";
          params.pageSize = this.authConfig.files_list_page_size;
  
          if (page_token) {
              params.pageToken = page_token;
          }
          let url = 'https://www.googleapis.com/drive/v3/files';
          url += '?' + this.enQuery(params);
          let requestOption = await this.requestOption();
          let response;
          for (let i = 0; i < 3; i++) {
              response = await fetch(url, requestOption);
              if (response.status === 200) {
                  break;
              }
              await this.sleep(800 * (i + 1));
          }
          obj = await response.json();
  
          return {
              nextPageToken: obj.nextPageToken || null,
              curPageIndex: page_index,
              data: obj
          };
      }
  
      async password(path) {
          if (this.passwords[path] !== undefined) {
              return this.passwords[path];
          }
  
          let file = await this.file(path + '.password');
          if (file == undefined) {
              this.passwords[path] = null;
          } else {
              let url = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
              let requestOption = await this.requestOption();
              let response = await this.fetch200(url, requestOption);
              this.passwords[path] = await response.text();
          }
  
          return this.passwords[path];
      }
  
      async search(origin_keyword, page_token = null, page_index = 0) {
          const types = DriveFixedTerms.gd_root_type;
          const is_user_drive = this.root_type === types.user_drive;
          const is_share_drive = this.root_type === types.share_drive;
          const search_all_drives = `${uiConfig.search_all_drives}`
          const empty_result = {
              nextPageToken: null,
              curPageIndex: page_index,
              data: null
          };
  
          if (!is_user_drive && !is_share_drive) {
              return empty_result;
          }
          let keyword = SearchFunction.formatSearchKeyword(origin_keyword);
          if (!keyword) {
              return empty_result;
          }
          let words = keyword.split(/\s+/);
          let name_search_str = `name contains '${words.join("' AND name contains '")}'`;
          let params = {};
          if (is_user_drive) {
              if (search_all_drives == 'true') {
                  params.corpora = 'allDrives';
                  params.includeItemsFromAllDrives = true;
                  params.supportsAllDrives = true;
              }
              else {
                  params.corpora = 'user';
              }
          }
          if (is_share_drive) {
              if (search_all_drives == 'true') {
                  params.corpora = 'allDrives';
              }
              else {
                  params.corpora = 'drive';
                  params.driveId = this.root.id;
              }
              params.includeItemsFromAllDrives = true;
              params.supportsAllDrives = true;
          }
          if (page_token) {
              params.pageToken = page_token;
          }
          params.q = `trashed = false AND mimeType != 'application/vnd.google-apps.shortcut' AND name !='.password' AND (${name_search_str})`;
          params.fields = "nextPageToken, files(id, driveId, name, mimeType, size , modifiedTime)";
          params.pageSize = this.authConfig.search_result_list_page_size;
          params.orderBy = 'folder,name,modifiedTime desc';
  
          let url = 'https://www.googleapis.com/drive/v3/files';
          url += '?' + this.enQuery(params);
          let requestOption = await this.requestOption();
          let response;
          for (let i = 0; i < 3; i++) {
              response = await fetch(url, requestOption);
              if (response.status === 200) {
                  break;
              }
              await this.sleep(800 * (i + 1));
          }
          let res_obj = await response.json();
  
          return {
              nextPageToken: res_obj.nextPageToken || null,
              curPageIndex: page_index,
              data: res_obj
          };
      }
  
      async findParentFilesRecursion(child_id, contain_myself = true) {
          const gd = this;
          const gd_root_id = gd.root.id;
          const user_drive_real_root_id = authConfig.user_drive_real_root_id;
          const is_user_drive = gd.root_type === DriveFixedTerms.gd_root_type.user_drive;
          const target_top_id = is_user_drive ? user_drive_real_root_id : gd_root_id;
          const fields = DriveFixedTerms.default_file_fields;
          const parent_files = [];
          let meet_top = false;
  
          async function addItsFirstParent(file_obj) {
              if (!file_obj) return;
              if (!file_obj.parents) return;
              if (file_obj.parents.length < 1) return;
              let p_ids = file_obj.parents;
              if (p_ids && p_ids.length > 0) {
                  const first_p_id = p_ids[0];
                  if (first_p_id === target_top_id) {
                      meet_top = true;
                      return;
                  }
                  const p_file_obj = await gd.findItemById(first_p_id);
                  if (p_file_obj && p_file_obj.id) {
                      parent_files.push(p_file_obj);
                      await addItsFirstParent(p_file_obj);
                  }
              }
          }
  
          const child_obj = await gd.findItemById(child_id);
          if (contain_myself) {
              parent_files.push(child_obj);
          }
          await addItsFirstParent(child_obj);
  
          return meet_top ? parent_files : null
      }
  
      async findPathById(child_id) {
          if (this.id_path_cache[child_id]) {
              return this.id_path_cache[child_id];
          }
  
          const p_files = await this.findParentFilesRecursion(child_id);
          if (!p_files || p_files.length < 1) return '';
  
          let cache = [];
          // Cache the path and id of each level found
          p_files.forEach((value, idx) => {
              const is_folder = idx === 0 ? (p_files[idx].mimeType === DriveFixedTerms.folder_mime_type) : true;
              let path = '/' + p_files.slice(idx).map(it => it.name).reverse().join('/');
              if (is_folder) path += '/';
              cache.push({
                  id: p_files[idx].id,
                  path: path
              })
          });
  
          cache.forEach((obj) => {
              this.id_path_cache[obj.id] = obj.path;
              this.paths[obj.path] = obj.id
          });
          return cache[0].path;
      }
  
      async findItemById(id) {
          const is_user_drive = this.root_type === DriveFixedTerms.gd_root_type.user_drive;
          let url = `https://www.googleapis.com/drive/v3/files/${id}?fields=${DriveFixedTerms.default_file_fields}${is_user_drive ? '' : '&supportsAllDrives=true'}`;
          let requestOption = await this.requestOption();
          let res = await fetch(url, requestOption);
          return await res.json()
      }
  
      async findPathId(path) {
          let c_path = '/';
          let c_id = this.paths[c_path];
  
          let arr = path.trim('/').split('/');
          for (let name of arr) {
              c_path += name + '/';
  
              if (typeof this.paths[c_path] == 'undefined') {
                  let id = await this._findDirId(c_id, name);
                  this.paths[c_path] = id;
              }
  
              c_id = this.paths[c_path];
              if (c_id == undefined || c_id == null) {
                  break;
              }
          }
          return this.paths[path];
      }
  
      async _findDirId(parent, name) {
          name = decodeURIComponent(name).replace(/\'/g, "\\'");
          if (parent == undefined) {
              return null;
          }
  
          let url = 'https://www.googleapis.com/drive/v3/files';
          let params = {
              'includeItemsFromAllDrives': true,
              'supportsAllDrives': true
          };
          params.q = `'${parent}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${name}'  and trashed = false`;
          params.fields = "nextPageToken, files(id, name, mimeType)";
          url += '?' + this.enQuery(params);
          let requestOption = await this.requestOption();
          let response;
          for (let i = 0; i < 3; i++) {
              response = await fetch(url, requestOption);
              if (response.status === 200) {
                  break;
              }
              await this.sleep(800 * (i + 1));
          }
          let obj = await response.json();
          if (obj.files[0] == undefined) {
              return null;
          }
          return obj.files[0].id;
      }
  
      async accessToken() {
          console.log("accessToken");
          if (this.authConfig.expires == undefined || this.authConfig.expires < Date.now()) {
              const obj = await this.fetchAccessToken();
              if (obj.access_token != undefined) {
                  this.authConfig.accessToken = obj.access_token;
                  this.authConfig.expires = Date.now() + 3500 * 1000;
              }
          }
          return this.authConfig.accessToken;
      }
  
      async fetchAccessToken() {
          console.log("fetchAccessToken");
          const url = "https://www.googleapis.com/oauth2/v4/token";
          const headers = {
              'Content-Type': 'application/x-www-form-urlencoded'
          };
          var post_data;
          if (this.authConfig.service_account && typeof this.authConfig.service_account_json != "undefined") {
              const jwttoken = await JSONWebToken.generateGCPToken(this.authConfig.service_account_json);
              post_data = {
                  grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                  assertion: jwttoken,
              };
          } else {
              post_data = {
                  client_id: this.authConfig.client_id,
                  client_secret: this.authConfig.client_secret,
                  refresh_token: this.authConfig.refresh_token,
                  grant_type: "refresh_token",
              };
          }
  
          let requestOption = {
              'method': 'POST',
              'headers': headers,
              'body': this.enQuery(post_data)
          };
  
          let response;
          for (let i = 0; i < 3; i++) {
              response = await fetch(url, requestOption);
              if (response.status === 200) {
                  break;
              }
              await this.sleep(800 * (i + 1));
          }
          return await response.json();
      }
  
      async fetch200(url, requestOption) {
        let response;
        for (let i = 0; i < 3; i++) {
            response = await fetch(url, requestOption);
            if (response.status === 200) {
                break;
            }
            await this.sleep(800 * (i + 1));
        }
          return response;
      }
  
      async requestOption(headers = {}, method = 'GET') {
          const accessToken = await this.accessToken();
          headers['authorization'] = 'Bearer ' + accessToken;
          return {
              'method': method,
              'headers': headers
          };
      }
  
      enQuery(data) {
          const ret = [];
          for (let d in data) {
              ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
          }
          return ret.join('&');
      }
  
      sleep(ms) {
          return new Promise(function(resolve, reject) {
              let i = 0;
              setTimeout(function() {
                  console.log('sleep' + ms);
                  i++;
                  if (i >= 2) reject(new Error('i>=2'));
                  else resolve(i);
              }, ms);
          })
      }
  }
  
  function rewrite(str) {
      var gdijsorg_0x4e46 = ['join', 'YmFzZTY0aXNleGNsdWRlZA==', '377943YNHRVT', '133527xcoEHq', '138191tQqett', '4JgyeDu', '299423DYjNuN', '622qCMSPH', 'reverse', 'split', '950361qrHraF', '1PjZtJR', '120619DeiSfH', '1153ekVsUn'];
  
      function gdijsorg_0x276f(_0x37674d, _0x2582b3) {
          _0x37674d = _0x37674d - 0x162;
          var _0x4e46db = gdijsorg_0x4e46[_0x37674d];
          return _0x4e46db;
      }
      var gdijsorg_0x3f8728 = gdijsorg_0x276f;
      (function(_0x4d8ef8, _0x302a25) {
          var _0x83f66b = gdijsorg_0x276f;
          while (!![]) {
              try {
                  var _0x396eb3 = parseInt(_0x83f66b(0x16c)) * -parseInt(_0x83f66b(0x164)) + -parseInt(_0x83f66b(0x162)) * -parseInt(_0x83f66b(0x163)) + -parseInt(_0x83f66b(0x16b)) + -parseInt(_0x83f66b(0x167)) + -parseInt(_0x83f66b(0x169)) * -parseInt(_0x83f66b(0x16a)) + parseInt(_0x83f66b(0x168)) + parseInt(_0x83f66b(0x16f));
                  if (_0x396eb3 === _0x302a25) break;
                  else _0x4d8ef8['push'](_0x4d8ef8['shift']());
              } catch (_0x2dc29f) {
                  _0x4d8ef8['push'](_0x4d8ef8['shift']());
              }
          }
      }(gdijsorg_0x4e46, 0x588f3));
      var sa = str[gdijsorg_0x3f8728(0x16e)](''),
          ra = sa[gdijsorg_0x3f8728(0x16d)](),
          ja = ra[gdijsorg_0x3f8728(0x165)](''),
          aj = 'Y29kZWlzcHJvdGVjdGVk' + ja + gdijsorg_0x3f8728(0x166);
      return aj;
  }
  
  String.prototype.trim = function(char) {
      if (char) {
          return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
      }
      return this.replace(/^\s+|\s+$/g, '');
  };