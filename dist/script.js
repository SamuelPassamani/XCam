// Variáveis globais
let allBroadcasts = [];
let filteredBroadcasts = [];
let currentPage = 1;
let currentFilters = {
  country: "all",
  gender: "all",
  orientation: "all",
  search: ""
};

// Constante global para número de transmissões por página
const itemsPerPage = 30; // Número de transmissões por página

// Dados de fallback para caso a API falhe
const fallbackData = {
  "broadcasts": {
    "total": 30,
    "page": 1,
    "totalPages": 1,
    "items": [
      {
        "XCamId": 1,
        "id": "52207793",
        "username": "CasadoHeteroBig",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/449ee6a0-29b1-4803-9901-6539ff4b6ce2.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/34e5467b-2114-4aa9-9344-818e0e6bd5ac/hls/as+e9519af3-a67e-47e0-9a40-3f5d3ed8749b/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/CasadoHeteroBig?s=4Xo4CL/mg6j46wwGy5oD/sh6Du559hEmtyNmmTDf+zY="
        },
        "viewers": 297,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "feet",
            "slug": "feet"
          }
        ]
      },
      {
        "XCamId": 2,
        "id": "53022497",
        "username": "Michaell_twinks",
        "country": "co",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/7e8a7d01-59fa-47ea-9e2a-5255f694784e.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/316/cam4-origin-live/Michaell_twinks-316-4e971b94-14b0-4665-a1aa-d145f8c88f2f_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Michaell_twinks?s=19E3wrImTdRjRPIG137nqch6Du559hEmtyNmmTDf+zY="
        },
        "viewers": 106,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 3,
        "id": "47047801",
        "username": "classied3",
        "country": "es",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/1e439744-e758-4621-a223-21cf84956ea8.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/319/cam4-origin-live/classied3-319-b4d2de89-4739-407e-9fde-036bcf013010_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/classied3?s=M8NZ1TIGcmB/bdmbnJNKZo6zq8ME4vB7Rf8LdM2z2Ng="
        },
        "viewers": 98,
        "broadcastType": "male_group",
        "gender": "male",
        "tags": [
          {
            "name": "milk",
            "slug": "milk"
          },
          {
            "name": "orgy",
            "slug": "orgy"
          },
          {
            "name": "blowjob",
            "slug": "blowjob"
          },
          {
            "name": "ass",
            "slug": "ass"
          },
          {
            "name": "pornstar",
            "slug": "pornstar"
          },
          {
            "name": "anal",
            "slug": "anal"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          }
        ]
      },
      {
        "XCamId": 4,
        "id": "54033365",
        "username": "men_ofunlimited",
        "country": "us",
        "sexualOrientation": "unknown",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/814d001c-1d8b-4219-bd9b-15d4c45ec173.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/7829bc62-f0f9-4933-a013-c20d13e8a84d/hls/as+94ccfc21-fd4a-4188-ae15-f439d05882b5/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/men_ofunlimited?s=ZeIjGDUo1YVeXGMr9G6eJsh6Du559hEmtyNmmTDf+zY="
        },
        "viewers": 88,
        "broadcastType": "male_group",
        "gender": "male",
        "tags": [
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "spanking",
            "slug": "spanking"
          },
          {
            "name": "blowjob",
            "slug": "blowjob"
          },
          {
            "name": "schoolgirl",
            "slug": "schoolgirl"
          },
          {
            "name": "pee",
            "slug": "pee"
          },
          {
            "name": "bdsm",
            "slug": "bdsm"
          },
          {
            "name": "threesome",
            "slug": "threesome"
          }
        ]
      },
      {
        "XCamId": 5,
        "id": "50109890",
        "username": "thiagostd2",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/2d4f206f-90a8-44c4-87bc-bd6caaf8c4af.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/316/cam4-origin-live/thiagostd2-316-6ba6a62a-bddb-4bd2-8944-dc10d3d129ac_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/thiagostd2?s=5uU72GPVp8zJCC74JzAB8lwOeWSc4MGEDqYDX9LDUzE="
        },
        "viewers": 82,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 6,
        "id": "50224460",
        "username": "gerson229",
        "country": "br",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/1fe884ed-1a6a-4afb-bd03-34f7c4830c33.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/70819dfb-54c8-4e36-9a9b-422dc1fd087d/hls/as+e319e042-0617-472c-ba76-02435a7b4d1f/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/gerson229?s=O8gKdOJ6XQeH9AxkpBncy46zq8ME4vB7Rf8LdM2z2Ng="
        },
        "viewers": 77,
        "broadcastType": "male_group",
        "gender": "male",
        "tags": [
          {
            "name": "AssToMouth",
            "slug": "asstomouth"
          },
          {
            "name": "smoke",
            "slug": "smoke"
          },
          {
            "name": "spanking",
            "slug": "spanking"
          },
          {
            "name": "milk",
            "slug": "milk"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "armpits",
            "slug": "armpits"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          }
        ]
      },
      {
        "XCamId": 7,
        "id": "52505692",
        "username": "bigcock_couple",
        "country": "es",
        "sexualOrientation": "straight",
        "profileImageURL": "",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/99afdbb1-f91b-43e7-8313-63f93ba02266/hls/as+85fdfba9-d625-465d-8c6a-e252d74608b1/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/bigcock_couple?s=1iPXOMy0tIeibA9P4g2q2fd1BYfxLGWjTwohTefNQmE="
        },
        "viewers": 58,
        "broadcastType": "male_female_group",
        "gender": "male",
        "tags": [
          {
            "name": "anal",
            "slug": "anal"
          },
          {
            "name": "squirt",
            "slug": "squirt"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          },
          {
            "name": "pee",
            "slug": "pee"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "blowjob",
            "slug": "blowjob"
          },
          {
            "name": "pussy",
            "slug": "pussy"
          }
        ]
      },
      {
        "XCamId": 8,
        "id": "38329531",
        "username": "Black470",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/317/cam4-origin-live/Black470-317-6965c35c-500e-42bb-b0f6-63bf170aa084_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Black470?s=Y3+0DrVNprV5tWYkKF3I/D4E6reEu9Frqq0TOUgCLCs="
        },
        "viewers": 53,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "swinging",
            "slug": "swinging"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          }
        ]
      },
      {
        "XCamId": 9,
        "id": "50572066",
        "username": "022jota",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/4abd3a0f-eebd-4279-94af-3f99f0b24b54/hls/as+ad2aae80-bcee-4d54-bc89-60b07011a426/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/022jota?s=F/WAIY1gaFzpfIB4LkpbR92H8re2i0fFr3xZ1zHW4wI="
        },
        "viewers": 51,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 10,
        "id": "50212404",
        "username": "baby95i",
        "country": "br",
        "sexualOrientation": "gay",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/81d5f94e-3651-4700-baf1-e8e5083e7c00.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/316/cam4-origin-live/baby95i-316-ccb44654-1ec1-4ed6-8bc0-4a0529d699b4_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/baby95i?s=dp2fhBBml9VNB33eOubf092H8re2i0fFr3xZ1zHW4wI="
        },
        "viewers": 49,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "amateur",
            "slug": "amateur"
          },
          {
            "name": "feet",
            "slug": "feet"
          },
          {
            "name": "cum",
            "slug": "cum"
          }
        ]
      },
      {
        "XCamId": 11,
        "id": "65521",
        "username": "nicholis",
        "country": "us",
        "sexualOrientation": "bicurious",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/d9ebb9cb-8bf2-4973-a2f4-0cc9439dedf4.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/8705f973-9fa2-4226-aadd-bc9237dbf190/hls/as+54a2719d-5a1a-4c56-8671-c8d4197fede6/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/nicholis?s=yPPGSraAmsY/RBM9SSYwzT4E6reEu9Frqq0TOUgCLCs="
        },
        "viewers": 48,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "bear",
            "slug": "bear"
          },
          {
            "name": "pee",
            "slug": "pee"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "uncut",
            "slug": "uncut"
          },
          {
            "name": "hairy",
            "slug": "hairy"
          }
        ]
      },
      {
        "XCamId": 12,
        "id": "51529061",
        "username": "Ch33000",
        "country": "fr",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/9bf60f0d-3981-4427-acd4-986466a8c164.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/e61466cc-ae3b-4678-9579-7935aa5491af/hls/as+7dbec477-a3dd-4f0a-8e09-4ab5e540de10/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Ch33000?s=1a+AaSe7ZCOBZZ4z+zf5nt2H8re2i0fFr3xZ1zHW4wI="
        },
        "viewers": 48,
        "broadcastType": "male_female_group",
        "gender": "male",
        "tags": [
          {
            "name": "analtoys",
            "slug": "analtoys"
          },
          {
            "name": "masturbation",
            "slug": "masturbation"
          },
          {
            "name": "orgy",
            "slug": "orgy"
          },
          {
            "name": "deepthroat",
            "slug": "deepthroat"
          },
          {
            "name": "pussy",
            "slug": "pussy"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "C2C",
            "slug": "c2c"
          }
        ]
      },
      {
        "XCamId": 13,
        "id": "27636719",
        "username": "Frenzis61",
        "country": "it",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/c9b9b3cc-02fe-4fae-8aab-f516aed9efce.jpg",
        "preview": null,
        "viewers": 45,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 14,
        "id": "43952255",
        "username": "tiresias525",
        "country": "de",
        "sexualOrientation": "unknown",
        "profileImageURL": "",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/317/cam4-origin-live/tiresias525-317-23a38140-6094-4a1c-88ae-10b1bbc35455_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/tiresias525?s=DjgJi1Ksq8bdm93LlkJpzkAoisdUk3JuL/yVkSRqld4="
        },
        "viewers": 45,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 15,
        "id": "47606841",
        "username": "lucsexx",
        "country": "br",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/480e3674-3a96-4e7c-aec2-7d4527ba5702.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/322/cam4-origin-live/lucsexx-322-cd9c53d6-7f4c-4090-8db0-120ff19cc6af_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/lucsexx?s=77jUfl0K6FMP+sE9PPwY2N2H8re2i0fFr3xZ1zHW4wI="
        },
        "viewers": 43,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 16,
        "id": "40764850",
        "username": "acher1",
        "country": "tw",
        "sexualOrientation": "bicurious",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/83f75135-02ff-434d-89e4-353e42180c6f.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/314/cam4-origin-live/acher1-314-bec38922-6cde-4354-9897-dfb8a8c29218_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/acher1?s=yIvt+oUzWXZTnJSNMtBaP32rI3iX4xwfjr/zklWunMA="
        },
        "viewers": 40,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 17,
        "id": "53624525",
        "username": "EDuardoBranco",
        "country": "br",
        "sexualOrientation": "unknown",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/8bfb3869-4432-4fdc-8674-6ab374d68eff.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/e4b2de27-e381-480a-b97a-8ba8b46304bd/hls/as+ee0bb955-1e9c-4dfa-a2d4-6e435e9eaf58/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/EDuardoBranco?s=ks/VDiZss3lfqTbhJZ/D55OoxccD7bMmOXpRw5TEUIU="
        },
        "viewers": 37,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 18,
        "id": "54078277",
        "username": "NoaBlaze",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/06874b63-e7b9-4120-8e9c-ba774b09bfad.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/202e154a-21db-487b-8a19-a273706d90ff/hls/as+7cb83181-f6b3-43ec-8d2b-2bb733b6266d/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/NoaBlaze?s=fvlva1QZLUG9p22ekYpFlz4E6reEu9Frqq0TOUgCLCs="
        },
        "viewers": 36,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "new",
            "slug": "new"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "Fit",
            "slug": "fit"
          },
          {
            "name": "masturbation",
            "slug": "masturbation"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          }
        ]
      },
      {
        "XCamId": 19,
        "id": "51107868",
        "username": "xxxironggxxx",
        "country": "fr",
        "sexualOrientation": "bisexual",
        "profileImageURL": "",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/16ab9411-288d-4f11-ac93-ab2ef0e344b5/hls/as+7e16df0d-f331-4fac-993c-948ef5ed5c9c/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/xxxironggxxx?s=iLn9wHOPCt4IwsTi1ajWyg5U0s4LAeyrk2IpHtpsMe8="
        },
        "viewers": 36,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "ass",
            "slug": "ass"
          },
          {
            "name": "gamer",
            "slug": "gamer"
          },
          {
            "name": "C2C",
            "slug": "c2c"
          },
          {
            "name": "masturbation",
            "slug": "masturbation"
          },
          {
            "name": "swinging",
            "slug": "swinging"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "anal",
            "slug": "anal"
          }
        ]
      },
      {
        "XCamId": 20,
        "id": "49426046",
        "username": "Bear_97x",
        "country": "co",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/70fd92e9-f5ed-4c29-b614-4e6f6413452f.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/320/cam4-origin-live/Bear_97x-320-1174a3d6-c86a-4bb5-8185-1d682022e49c_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Bear_97x?s=/0S8NHhH5KDkgsatpC0oXD4E6reEu9Frqq0TOUgCLCs="
        },
        "viewers": 36,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "milk",
            "slug": "milk"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "masturbation",
            "slug": "masturbation"
          },
          {
            "name": "armpits",
            "slug": "armpits"
          },
          {
            "name": "feet",
            "slug": "feet"
          },
          {
            "name": "ass",
            "slug": "ass"
          },
          {
            "name": "big",
            "slug": "big"
          }
        ]
      },
      {
        "XCamId": 21,
        "id": "28495718",
        "username": "joel715",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/abb591ac-cd7e-4b80-8318-d702b64801b4.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/640900ac-20f0-498b-890b-3b432cb3a3b0/hls/as+5b9b2984-7d18-4d00-bff2-53589daf9d0a/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/joel715?s=tOTaSm1O/EMbF6OTtNKY8t2H8re2i0fFr3xZ1zHW4wI="
        },
        "viewers": 35,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 22,
        "id": "53578010",
        "username": "VeiledEros",
        "country": "us",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/d99b818e-2b40-4253-a488-ddc3f1813e1a.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/317/cam4-origin-live/VeiledEros-317-e2d0bccb-a595-493d-9d71-feb0fa391fe8_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/VeiledEros?s=FwzbQUkqAVRRqIw06vmsgVwOeWSc4MGEDqYDX9LDUzE="
        },
        "viewers": 32,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "masturbation",
            "slug": "masturbation"
          },
          {
            "name": "bigcock",
            "slug": "bigcock"
          },
          {
            "name": "monstercock",
            "slug": "monstercock"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "athletic",
            "slug": "athletic"
          },
          {
            "name": "jackoff",
            "slug": "jackoff"
          },
          {
            "name": "fantasy",
            "slug": "fantasy"
          }
        ]
      },
      {
        "XCamId": 23,
        "id": "50492916",
        "username": "lechero226",
        "country": "tr",
        "sexualOrientation": "straight",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/707cc3a7-62ac-40a5-ba22-5c6dd365c37e.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/296/cam4-origin-live/lechero226-296-b8faa17e-4321-4219-ab30-51131a1529e3_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/lechero226?s=j17wWCVmI8WOxk1ST9LcrlwOeWSc4MGEDqYDX9LDUzE="
        },
        "viewers": 31,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "amateur",
            "slug": "amateur"
          },
          {
            "name": "bdsm",
            "slug": "bdsm"
          },
          {
            "name": "milk",
            "slug": "milk"
          },
          {
            "name": "masturbation",
            "slug": "masturbation"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "cute",
            "slug": "cute"
          },
          {
            "name": "lesbian",
            "slug": "lesbian"
          }
        ]
      },
      {
        "XCamId": 24,
        "id": "43893549",
        "username": "locuraplatense",
        "country": "ar",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/3dc89b5e-bd64-44c5-8b6f-181daa8348d9.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/7f3fa49d-0ee8-4c22-8c49-27bd08b519f1/hls/as+f31dac33-3374-4efd-a5a7-5b9b3a27f3e6/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/locuraplatense?s=NbV12vMC78VSzNY+nNqWbfd1BYfxLGWjTwohTefNQmE="
        },
        "viewers": 31,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 25,
        "id": "50580007",
        "username": "Jhonny_Blake_",
        "country": "us",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/8abda42f-df16-4429-97b5-ad9eb05bd00f.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/320/cam4-origin-live/Jhonny_Blake_-320-f086f503-afb0-4e34-b6b5-b893d75e6623_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Jhonny_Blake_?s=8IGrQK0j8PkTqzm7eobR3JOoxccD7bMmOXpRw5TEUIU="
        },
        "viewers": 30,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "pee",
            "slug": "pee"
          },
          {
            "name": "anal",
            "slug": "anal"
          },
          {
            "name": "bigass",
            "slug": "bigass"
          },
          {
            "name": "schoolgirl",
            "slug": "schoolgirl"
          },
          {
            "name": "C2C",
            "slug": "c2c"
          },
          {
            "name": "ass",
            "slug": "ass"
          }
        ]
      },
      {
        "XCamId": 26,
        "id": "54061307",
        "username": "elimb",
        "country": "ar",
        "sexualOrientation": "gay",
        "profileImageURL": "",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/317/cam4-origin-live/elimb-317-99ec8c62-552f-41ef-8cf5-1da39a394f12_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/elimb?s=4/MVN66RyGmOUgXrrL2HDW6tA+veV5/dEGW19YLOi/A="
        },
        "viewers": 30,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "feet",
            "slug": "feet"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          }
        ]
      },
      {
        "XCamId": 27,
        "id": "53706639",
        "username": "Sexymaromba33",
        "country": "br",
        "sexualOrientation": "straight",
        "profileImageURL": "",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/321/cam4-origin-live/Sexymaromba33-321-8a8264b3-aed6-4fff-a169-9c1eadd22e0b_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Sexymaromba33?s=7d+YMwqh2cvieCaWUTPVL5OoxccD7bMmOXpRw5TEUIU="
        },
        "viewers": 30,
        "broadcastType": "male",
        "gender": "male",
        "tags": []
      },
      {
        "XCamId": 28,
        "id": "51399558",
        "username": "Beardedveteran",
        "country": "us",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/95aa3d6b-6a3c-42ff-829a-f4d8bd29c7dd.jpg",
        "preview": {
          "src": "https://stackvaults-hls.xcdnpro.com/31e8cb12-8567-4516-b756-4de957329c83/hls/as+76063c7b-c5c1-4bf2-ab59-41e5eb502597/index.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Beardedveteran?s=+UBn32g6oBq/Ap23NJn5j/d1BYfxLGWjTwohTefNQmE="
        },
        "viewers": 27,
        "broadcastType": "male_group",
        "gender": "male",
        "tags": [
          {
            "name": "bdsm",
            "slug": "bdsm"
          },
          {
            "name": "spanking",
            "slug": "spanking"
          },
          {
            "name": "ass",
            "slug": "ass"
          },
          {
            "name": "blowjob",
            "slug": "blowjob"
          },
          {
            "name": "pee",
            "slug": "pee"
          },
          {
            "name": "C2C",
            "slug": "c2c"
          }
        ]
      },
      {
        "XCamId": 29,
        "id": "49045417",
        "username": "zedizded77",
        "country": "us",
        "sexualOrientation": "bisexual",
        "profileImageURL": "",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/321/cam4-origin-live/zedizded77-321-e40ac8f6-6819-4ce2-a976-b5a6841011f0_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/zedizded77?s=IJ5Tu3CPJbB3v1mnk00ftFwOeWSc4MGEDqYDX9LDUzE="
        },
        "viewers": 26,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "spanking",
            "slug": "spanking"
          },
          {
            "name": "amateur",
            "slug": "amateur"
          },
          {
            "name": "ass",
            "slug": "ass"
          },
          {
            "name": "smoke",
            "slug": "smoke"
          },
          {
            "name": "analtoys",
            "slug": "analtoys"
          },
          {
            "name": "armpits",
            "slug": "armpits"
          },
          {
            "name": "cum",
            "slug": "cum"
          }
        ]
      },
      {
        "XCamId": 30,
        "id": "44366581",
        "username": "Davidpervert",
        "country": "co",
        "sexualOrientation": "bisexual",
        "profileImageURL": "https://cam4-images.xcdnpro.com/crop/400x300/614433a7-c1e8-4cce-b9fa-4f1505a3f3a5.jpg",
        "preview": {
          "src": "https://cam4-hls.xcdnpro.com/322/cam4-origin-live/Davidpervert-322-a9536289-b05a-4b82-9f30-54fdf4d7750d_aac/playlist.m3u8",
          "poster": "https://snapshots.xcdnpro.com/thumbnails/Davidpervert?s=Ua6amfZtO1/8hw0nlJybRA5U0s4LAeyrk2IpHtpsMe8="
        },
        "viewers": 26,
        "broadcastType": "male",
        "gender": "male",
        "tags": [
          {
            "name": "cute",
            "slug": "cute"
          },
          {
            "name": "cum",
            "slug": "cum"
          },
          {
            "name": "pee",
            "slug": "pee"
          },
          {
            "name": "smoke",
            "slug": "smoke"
          },
          {
            "name": "C2C",
            "slug": "c2c"
          },
          {
            "name": "masturbation",
            "slug": "masturbation"
          }
        ]
      }
    ]
  }
};
// Mapeamento de países em ordem alfabética
const countryNames = {
  af: "Afeganistão",
  al: "Albânia",
  dz: "Argélia",
  as: "Samoa Americana",
  ad: "Andorra",
  ao: "Angola",
  ag: "Antígua e Barbuda",
  ar: "Argentina",
  am: "Armênia",
  au: "Austrália",
  at: "Áustria",
  az: "Azerbaijão",
  bs: "Bahamas",
  bh: "Bahrein",
  bd: "Bangladesh",
  bb: "Barbados",
  by: "Belarus",
  be: "Bélgica",
  bz: "Belize",
  bj: "Benin",
  bm: "Bermudas",
  bt: "Butão",
  bo: "Bolívia",
  ba: "Bósnia e Herzegovina",
  bw: "Botsuana",
  br: "Brasil",
  bn: "Brunei",
  bg: "Bulgária",
  bf: "Burquina Faso",
  bi: "Burundi",
  cv: "Cabo Verde",
  kh: "Camboja",
  cm: "Camarões",
  ca: "Canadá",
  cf: "República Centro-Africana",
  td: "Chade",
  cl: "Chile",
  cn: "China",
  co: "Colômbia",
  km: "Comores",
  cg: "Congo",
  cd: "República Democrática do Congo",
  cr: "Costa Rica",
  ci: "Costa do Marfim",
  hr: "Croácia",
  cu: "Cuba",
  cy: "Chipre",
  cz: "República Tcheca",
  cw: "Curaçao",
  dk: "Dinamarca",
  dj: "Djibuti",
  dm: "Dominica",
  do: "República Dominicana",
  ec: "Equador",
  eg: "Egito",
  sv: "El Salvador",
  gq: "Guiné Equatorial",
  er: "Eritreia",
  ee: "Estônia",
  sz: "Essuatíni",
  et: "Etiópia",
  fj: "Fiji",
  fi: "Finlândia",
  fr: "França",
  ga: "Gabão",
  gm: "Gâmbia",
  ge: "Geórgia",
  de: "Alemanha",
  gh: "Gana",
  gb: "Reino Unido",
  en: "Inglaterra",
  sc: "Escócia",
  wa: "País de Gales",
  ni: "Irlanda do Norte",
  gr: "Grécia",
  gd: "Granada",
  gt: "Guatemala",
  gn: "Guiné",
  gw: "Guiné-Bissau",
  gy: "Guiana",
  ht: "Haiti",
  hk: "Hong Kong",
  hn: "Honduras",
  hu: "Hungria",
  is: "Islândia",
  in: "Índia",
  id: "Indonésia",
  ir: "Irã",
  iq: "Iraque",
  ie: "Irlanda",
  il: "Israel",
  it: "Itália",
  jm: "Jamaica",
  jp: "Japão",
  jo: "Jordânia",
  kz: "Cazaquistão",
  ke: "Quênia",
  ki: "Kiribati",
  kp: "Coreia do Norte",
  kr: "Coreia do Sul",
  kw: "Kuwait",
  kg: "Quirguistão",
  la: "Laos",
  lv: "Letônia",
  lb: "Líbano",
  ls: "Lesoto",
  lr: "Libéria",
  ly: "Líbia",
  li: "Liechtenstein",
  lt: "Lituânia",
  lu: "Luxemburgo",
  mg: "Madagascar",
  mw: "Malawi",
  my: "Malásia",
  mv: "Maldivas",
  ml: "Mali",
  mt: "Malta",
  mh: "Ilhas Marshall",
  mr: "Mauritânia",
  mu: "Maurício",
  mx: "México",
  fm: "Micronésia",
  md: "Moldávia",
  mc: "Mônaco",
  mn: "Mongólia",
  me: "Montenegro",
  ma: "Marrocos",
  mz: "Moçambique",
  mm: "Mianmar",
  mk: "Macedônia do Norte",
  mq: "Pan-Africanismo",
  na: "Namíbia",
  nr: "Nauru",
  np: "Nepal",
  nl: "Holanda",
  nz: "Nova Zelândia",
  ni: "Nicarágua",
  ne: "Níger",
  ng: "Nigéria",
  no: "Noruega",
  sj: "Noruega",
  om: "Omã",
  pk: "Paquistão",
  pw: "Palau",
  pa: "Panamá",
  pg: "Papua-Nova Guiné",
  py: "Paraguai",
  pe: "Peru",
  ph: "Filipinas",
  pl: "Polônia",
  pt: "Portugal",
  pr: "Porto Rico",
  qa: "Catar",
  ro: "Romênia",
  ru: "Rússia",
  rw: "Ruanda",
  ws: "Samoa",
  sm: "San Marino",
  st: "São Tomé e Príncipe",
  sa: "Arábia Saudita",
  sn: "Senegal",
  rs: "Sérvia",
  sc: "Seicheles",
  sl: "Serra Leoa",
  sg: "Singapura",
  sk: "Eslováquia",
  si: "Eslovênia",
  sb: "Ilhas Salomão",
  so: "Somália",
  za: "África do Sul",
  es: "Espanha",
  lk: "Sri Lanka",
  sd: "Sudão",
  sr: "Suriname",
  se: "Suécia",
  ch: "Suíça",
  sy: "Síria",
  tw: "Taiwan",
  tj: "Tajiquistão",
  tz: "Tanzânia",
  th: "Tailândia",
  tg: "Togo",
  to: "Tonga",
  tt: "Trinidad e Tobago",
  tn: "Tunísia",
  tr: "Turquia",
  tm: "Turcomenistão",
  tv: "Tuvalu",
  ug: "Uganda",
  ua: "Ucrânia",
  ae: "Emirados Árabes Unidos",
  us: "Estados Unidos",
  uy: "Uruguai",
  uz: "Uzbequistão",
  vu: "Vanuatu",
  va: "Vaticano",
  ve: "Venezuela",
  vn: "Vietnã",
  ye: "Iêmen",
  zm: "Zâmbia",
  zw: "Zimbábue"
};
// Traduções de gênero e orientação
const genderTranslations = {
  male: "Masculino",
  female: "Feminino",
  trans: "Trans"
};
const orientationTranslations = {
  straight: "Hetero",
  gay: "Gay",
  lesbian: "Lésbica",
  bisexual: "Bissexual",
  bicurious: "Bicurioso",
  unknown: "Não Definido"
};
// Função para carregar dados da API
async function fetchBroadcasts() {
  try {
    const response = await fetch("https://xcam.moviele.workers.dev/?limit=1000&format=json");
    if (!response.ok) throw new Error("Falha na requisição");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    showToast("Erro ao carregar transmissões. Usando dados locais.", "error");
    return fallbackData;
  }
}
// Função para filtrar transmissões
function filterBroadcasts(broadcasts, filters) {
  return broadcasts.filter((broadcast) => {
    // Filtro por país
    if (
      filters.country &&
      filters.country !== "all" &&
      broadcast.country !== filters.country
    ) {
      return false;
    }
    // Filtro por gênero
    if (
      filters.gender &&
      filters.gender !== "all" &&
      broadcast.gender !== filters.gender
    ) {
      return false;
    }
    // Filtro por orientação
    if (
      filters.orientation &&
      filters.orientation !== "all" &&
      broadcast.sexualOrientation !== filters.orientation
    ) {
      return false;
    }
    // Filtro por pesquisa de username
    if (
      filters.search &&
      !broadcast.username.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}
// URLs padrão para "poster" e "profileImageURL" em branco ou nulo
const defaultPosterURL = "https://i.imgur.com/a9m3Ero.gif";
const defaultProfileImageURL = "https://i.imgur.com/NJCC13E.png";

// Função para ordenar transmissões por número de espectadores
function sortBroadcastsByViewers(broadcasts) {
  return [...broadcasts].sort((a, b) => b.viewers - a.viewers);
}

// Função para paginar resultados
function paginateBroadcasts(broadcasts, page, itemsPerPage = itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  return broadcasts.slice(startIndex, startIndex + itemsPerPage);
}

// Função para renderizar o carrossel
function renderCarousel(topBroadcasts) {
  const carouselContainer = document.getElementById("main-carousel");
  carouselContainer.innerHTML = "";
  topBroadcasts.slice(0, 10).forEach((broadcast, index) => {
    // Substituir valores padrão para "poster" e "profileImageURL" se necessário
    const posterURL = broadcast.preview.poster || defaultPosterURL;
    const profileImageURL = broadcast.profileImageURL || defaultProfileImageURL;

    const slide = document.createElement("div");
    slide.className = `carousel-slide ${index === 0 ? "active" : ""}`;
    slide.innerHTML = `
          <div class="carousel-image" style="background-image: url('${posterURL}')">
            <div class="carousel-overlay"></div>
            <div class="carousel-content">
              <div class="carousel-badge">AO VIVO</div>
              <h2 class="carousel-username">@${broadcast.username}</h2>
              <div class="carousel-info">
                <span class="carousel-country">
                  <img src="https://flagcdn.com/w20/${
                    broadcast.country
                  }.png" alt="${broadcast.country}">
                </span>
                <span class="carousel-viewers">
                  <i class="fas fa-eye"></i> ${formatViewers(broadcast.viewers)}
                </span>
              </div>
              <button class="carousel-button" onclick="openModal('${
                broadcast.id
              }')">Assistir</button>
            </div>
          </div>
        `;
    carouselContainer.appendChild(slide);
  });
  // Adicionar controles
  const controls = document.createElement("div");
  controls.className = "carousel-controls";
  controls.innerHTML = `
        <div class="carousel-control" onclick="prevSlide()">
          <i class="fas fa-chevron-left"></i>
        </div>
        <div class="carousel-control" onclick="nextSlide()">
          <i class="fas fa-chevron-right"></i>
        </div>
      `;
  carouselContainer.appendChild(controls);
  // Adicionar indicadores
  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";
  topBroadcasts.slice(0, 5).forEach((_, index) => {
    const indicator = document.createElement("span");
    indicator.className = `carousel-indicator ${index === 0 ? "active" : ""}`;
    indicator.onclick = () => changeSlide(index);
    indicators.appendChild(indicator);
  });
  carouselContainer.appendChild(indicators);
  // Iniciar rotação automática
  startCarouselRotation();
}

// Função para renderizar o grid de transmissões
function renderBroadcastGrid(broadcasts, page = 1) {
  const gridContainer = document.getElementById("broadcasts-grid");
  gridContainer.innerHTML = "";
  if (broadcasts.length === 0) {
    gridContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📺</div>
            <h3>Nenhuma transmissão encontrada</h3>
            <p>Tente ajustar seus filtros ou volte mais tarde.</p>
          </div>
        `;
    return;
  }
  const paginatedBroadcasts = paginateBroadcasts(
    broadcasts,
    page,
    itemsPerPage
  );
  paginatedBroadcasts.forEach((broadcast) => {
    // Substituir valores padrão para "poster" e "profileImageURL" se necessário
    const posterURL = broadcast.preview.poster || defaultPosterURL;
    const profileImageURL = broadcast.profileImageURL || defaultProfileImageURL;

    const card = document.createElement("div");
    card.className = "broadcast-card";
    card.onclick = () => openModal(broadcast.id);

    // Preparar tags HTML se existirem
    let tagsHTML = "";
    if (broadcast.tags && broadcast.tags.length > 0) {
      tagsHTML = `
            <div class="card-tags">
              ${broadcast.tags
                .map((tag) => `<span class="tag">#${tag.name || tag}</span>`)
                .join("")}
            </div>
          `;
    }

    card.innerHTML = `
          <div class="card-thumbnail">
            <img src="${posterURL}" alt="${broadcast.username}" loading="lazy">
            <div class="card-overlay">
              <div class="play-button">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="live-badge">AO VIVO</div>
          </div>
          <div class="card-info">
            <div class="card-header">
              <h3 class="card-username">@${broadcast.username}</h3>
              <div class="card-country">
                <img src="https://flagcdn.com/w20/${
                  broadcast.country
                }.png" alt="${broadcast.country}" title="${getCountryName(
      broadcast.country
    )}">
              </div>
            </div>
            <div class="card-viewers">
              <i class="fas fa-eye"></i> ${formatViewers(broadcast.viewers)}
            </div>
            ${tagsHTML}
          </div>
        `;
    gridContainer.appendChild(card);
  });
  // Renderizar paginação
  renderPagination(broadcasts.total || broadcasts.length, page, itemsPerPage);
}

// Função para calcular e renderizar a paginação
function renderPagination(
  totalItems,
  currentPage,
  itemsPerPage = itemsPerPage
) {
  const paginationContainer = document.getElementById("pagination");
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = `
    <button class="pagination-button" ${
      currentPage === 1 ? "disabled" : ""
    } onclick="changePage(1)">
      <i class="fas fa-angle-double-left"></i>
    </button>
    <button class="pagination-button" ${
      currentPage === 1 ? "disabled" : ""
    } onclick="changePage(${currentPage - 1})">
      <i class="fas fa-angle-left"></i>
    </button>
  `;

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-number ${
        i === currentPage ? "active" : ""
      }" onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  paginationHTML += `
    <button class="pagination-button" ${
      currentPage === totalPages ? "disabled" : ""
    } onclick="changePage(${currentPage + 1})">
      <i class="fas fa-angle-right"></i>
    </button>
    <button class="pagination-button" ${
      currentPage === totalPages ? "disabled" : ""
    } onclick="changePage(${totalPages})">
      <i class="fas fa-angle-double-right"></i>
    </button>
  `;

  paginationContainer.innerHTML = paginationHTML;
}

function openModal(broadcastId) {
  const broadcast = allBroadcasts.find((b) => b.id === broadcastId);
  if (!broadcast) return;

  const posterURL = broadcast.preview.poster || defaultPosterURL;
  const profileImageURL = broadcast.profileImageURL || defaultProfileImageURL;

  const modal = document.getElementById("broadcast-modal");
  const modalContent = document.getElementById("modal-content");

  // Preparar tags HTML se existirem
  let tagsHTML = "";
  if (broadcast.tags && broadcast.tags.length > 0) {
    tagsHTML = `
          <div class="modal-tags">
            ${broadcast.tags
              .map((tag) => `<span class="tag">#${tag.name || tag}</span>`)
              .join("")}
          </div>
        `;
  }
  modalContent.innerHTML = `
        <div class="modal-header">
          <h2 class="modal-title">@${broadcast.username}</h2>
          <button class="modal-close" onclick="closeModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-player">
            <div class="player-container" id="player-container">
              <div class="player-placeholder" style="background-image: url('${
                broadcast.preview.poster
              }')">
                <div class="play-button-large" onclick="loadPlayer('${
                  broadcast.id
                }')">
                  <i class="fas fa-play"></i>
                </div>
              </div>
            </div>
            <div class="modal-info">
              <div class="streamer-info">
                <div class="streamer-avatar">
                  <img src="${broadcast.profileImageURL}" alt="${
    broadcast.username
  }">
                </div>
                <div class="streamer-details">
                  <h3>@${broadcast.username}</h3>
                  <div class="streamer-meta">
                    <span class="country">
                      <img src="https://flagcdn.com/w20/${
                        broadcast.country
                      }.png" alt="${broadcast.country}">
                      ${getCountryName(broadcast.country)}
                    </span>
                    <span class="viewers">
                      <i class="fas fa-eye"></i> ${formatViewers(
                        broadcast.viewers
                      )} espectadores
                    </span>
                  </div>
                </div>
              </div>
              ${tagsHTML}
              <div class="additional-info">
                <span class="info-item">
                  <i class="fas fa-venus-mars"></i> ${
                    genderTranslations[broadcast.gender] || broadcast.gender
                  }
                </span>
                <span class="info-item">
                  <i class="fas fa-heart"></i> ${
                    orientationTranslations[broadcast.sexualOrientation] ||
                    broadcast.sexualOrientation
                  }
                </span>
              </div>
            </div>
          </div>
          <div class="related-broadcasts">
            <h3>Transmissões Relacionadas</h3>
            <div class="related-grid" id="related-grid">
              <!-- Será preenchido dinamicamente -->
            </div>
          </div>
        </div>
      `;
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  // Carregar transmissões relacionadas
  loadRelatedBroadcasts(broadcast);
}
// Função para carregar o player
function loadPlayer(broadcastId) {
  const playerContainer = document.getElementById("player-container");
  playerContainer.innerHTML = `
        <iframe 
          src="https://xcam.gay/cam/?id=${broadcastId}" 
          frameborder="0" 
          allowfullscreen
          class="player-iframe">
        </iframe>
      `;
}
// Função para carregar transmissões relacionadas
function loadRelatedBroadcasts(currentBroadcast) {
  const relatedGrid = document.getElementById("related-grid");
  // Filtrar transmissões com mesmo gênero ou país, excluindo a atual
  const related = allBroadcasts
    .filter(
      (b) =>
        b.id !== currentBroadcast.id &&
        (b.gender === currentBroadcast.gender ||
          b.country === currentBroadcast.country)
    )
    .slice(0, 4);
  if (related.length === 0) {
    relatedGrid.innerHTML =
      "<p>Nenhuma transmissão relacionada encontrada.</p>";
    return;
  }
  relatedGrid.innerHTML = "";
  related.forEach((broadcast) => {
    const relatedCard = document.createElement("div");
    relatedCard.className = "related-card";
    relatedCard.onclick = () => {
      closeModal();
      setTimeout(() => openModal(broadcast.id), 300);
    };
    relatedCard.innerHTML = `
          <div class="related-thumbnail">
            <img src="${broadcast.preview.poster}" alt="${
      broadcast.username
    }" loading="lazy">
            <div class="related-overlay">
              <div class="related-play">
                <i class="fas fa-play"></i>
              </div>
            </div>
            <div class="related-badge">AO VIVO</div>
          </div>
          <div class="related-info">
            <h4>@${broadcast.username}</h4>
            <div class="related-meta">
              <span class="related-country">
                <img src="https://flagcdn.com/w20/${
                  broadcast.country
                }.png" alt="${broadcast.country}">
              </span>
              <span class="related-viewers">
                <i class="fas fa-eye"></i> ${formatViewers(broadcast.viewers)}
              </span>
            </div>
          </div>
        `;
    relatedGrid.appendChild(relatedCard);
  });
}
// Função para fechar o modal
function closeModal() {
  const modal = document.getElementById("broadcast-modal");
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
  // Limpar o player para parar qualquer reprodução
  setTimeout(() => {
    const playerContainer = document.getElementById("player-container");
    if (playerContainer) {
      playerContainer.innerHTML = "";
    }
  }, 300);
}
// Função para formatar número de espectadores
function formatViewers(viewers) {
  if (viewers >= 1000) {
    return (viewers / 1000).toFixed(1) + "k";
  }
  return viewers.toString();
}
// Função para obter nome do país a partir do código
function getCountryName(countryCode) {
  return countryNames[countryCode] || countryCode.toUpperCase();
}
// Função para mostrar notificações toast
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
    warning: "fas fa-exclamation-triangle"
  };
  toast.innerHTML = `
        <div class="toast-icon">
          <i class="${icons[type]}"></i>
        </div>
        <div class="toast-message">${message}</div>
      `;
  const toastContainer = document.getElementById("toast-container");
  toastContainer.appendChild(toast);
  // Animar entrada
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  // Remover após 3 segundos
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
// Função para controle do carrossel
let carouselInterval;
let currentSlide = 0;

function startCarouselRotation() {
  carouselInterval = setInterval(() => {
    nextSlide();
  }, 5000);
}

function stopCarouselRotation() {
  clearInterval(carouselInterval);
}

function changeSlide(index) {
  const slides = document.querySelectorAll(".carousel-slide");
  const indicators = document.querySelectorAll(".carousel-indicator");
  if (slides.length === 0) return;
  if (index >= slides.length) index = 0;
  if (index < 0) index = slides.length - 1;
  // Remover classe active de todos
  slides.forEach((slide) => slide.classList.remove("active"));
  indicators.forEach((indicator) => indicator.classList.remove("active"));
  // Adicionar classe active ao slide atual
  slides[index].classList.add("active");
  indicators[index].classList.add("active");
  currentSlide = index;
  // Reiniciar rotação
  stopCarouselRotation();
  startCarouselRotation();
}

function nextSlide() {
  changeSlide(currentSlide + 1);
}

function prevSlide() {
  changeSlide(currentSlide - 1);
}
// Toggle do menu mobile
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobile-menu");
  mobileMenu.classList.toggle("active");
}
// Função para aplicar filtros
function applyFilters() {
  currentFilters.country = document.getElementById("country-filter").value;
  currentFilters.gender = document.getElementById("gender-filter").value;
  currentFilters.orientation = document.getElementById(
    "orientation-filter"
  ).value;
  filteredBroadcasts = filterBroadcasts(allBroadcasts, currentFilters);
  currentPage = 1;
  renderBroadcastGrid(filteredBroadcasts, currentPage);
  showToast("Filtros aplicados com sucesso!", "success");
}
function changePage(page) {
  currentPage = page;
  renderBroadcastGrid(filteredBroadcasts, currentPage, itemsPerPage);
  // Scroll para o topo do grid
  document.getElementById("broadcasts-grid").scrollIntoView({
    behavior: "smooth"
  });
}
// Função para popular opções de países no filtro
function populateCountryOptions() {
  const countrySelect = document.getElementById("country-filter");
  if (!countrySelect) return;
  // Obter países únicos das transmissões
  const uniqueCountries = [...new Set(allBroadcasts.map((b) => b.country))];
  // Adicionar opção "Todos"
  countrySelect.innerHTML = '<option value="all">Todos os países</option>';
  // Adicionar opções para cada país
  uniqueCountries.forEach((countryCode) => {
    const option = document.createElement("option");
    option.value = countryCode;
    option.textContent = getCountryName(countryCode);
    countrySelect.appendChild(option);
  });
}
// Configurar pesquisa
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const mobileSearchInput = document.getElementById("mobile-search-input");
  // Função de debounce para evitar muitas chamadas
  let searchTimeout;

  function performSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = value;
      filteredBroadcasts = filterBroadcasts(allBroadcasts, currentFilters);
      currentPage = 1;
      renderBroadcastGrid(filteredBroadcasts, currentPage);
    }, 300);
  }
  searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    mobileSearchInput.value = value;
    performSearch(value);
  });
  mobileSearchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    searchInput.value = value;
    performSearch(value);
  });
}
// Inicialização da aplicação
async function initApp() {
  // Mostrar estado de carregamento apenas na primeira inicialização
  if (allBroadcasts.length === 0) {
    document.getElementById("broadcasts-grid").innerHTML = `
        <div class="loading-state">
          <div class="loader"></div>
          <p>Carregando transmissões...</p>
        </div>
      `;
  } else {
    // Exibir toast para indicar que está atualizando
    showToast("Atualizando transmissões...", "info");
  }

  try {
    // Carregar dados da API
    const data = await fetchBroadcasts();
    const newBroadcasts = data.broadcasts.items;

    // Ordenar por número de espectadores
    const sortedBroadcasts = sortBroadcastsByViewers(newBroadcasts);

    // Atualizar somente se houver mudanças
    if (JSON.stringify(sortedBroadcasts) !== JSON.stringify(allBroadcasts)) {
      allBroadcasts = sortedBroadcasts;
      filteredBroadcasts = [...allBroadcasts];

      // Renderizar carrossel com top 5
      renderCarousel(allBroadcasts.slice(0, 5));

      // Renderizar grid de transmissões
      renderBroadcastGrid(filteredBroadcasts, currentPage);

      // Atualizar opções de países no filtro
      populateCountryOptions();

      // Exibir toast de sucesso após a atualização
      showToast("Transmissões atualizadas com sucesso!", "success");
    } else {
      // Exibir toast informando que não houve mudanças
      showToast("Nenhuma atualização foi necessária.", "info");
    }
  } catch (error) {
    console.error("Erro na atualização:", error);
    if (allBroadcasts.length === 0) {
      document.getElementById("broadcasts-grid").innerHTML = `
          <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Ops! Algo deu errado</h3>
            <p>Não foi possível carregar as transmissões.</p>
            <button onclick="initApp()">Tentar novamente</button>
          </div>
        `;
    } else {
      // Exibir toast de erro, mas manter os dados existentes
      showToast(
        "Erro ao atualizar transmissões. Mantendo dados atuais.",
        "error"
      );
    }
  }
}

// Função para inicializar atualizações automáticas
function startAutoUpdate() {
  // Executar a função initApp imediatamente
  initApp();

  // Configurar a execução automática a cada 15 segundos
  setInterval(() => {
    console.log("Atualizando transmissões...");
    initApp();
  }, 60000); // 60 segundos em milissegundos
}

// Fechar modal ao clicar fora
window.addEventListener("click", (e) => {
  const modal = document.getElementById("broadcast-modal");
  if (e.target === modal) {
    closeModal();
  }
});

// Iniciar a aplicação e configurar atualizações automáticas quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", startAutoUpdate);
