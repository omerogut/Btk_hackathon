from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import google.generativeai as genai
import json
import re
import os 
from dotenv import load_dotenv

load_dotenv()

def index(request):
    return render(request, 'index.html')


@csrf_exempt
def generate_quiz(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        text = data.get('text', '').strip()
        
        if not text:
            return JsonResponse({'error': 'Text is required'}, status=400)
        
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        Verilen metin üzerinden anlamlı ve çeşitli soru-cevaplar üretin. 
        Sorular metnin farklı bölümlerini kapsamalı ve her biri dört şıklı olmalıdır. 
        Her şık benzersiz olmalı ve yalnızca bir doğru cevap içermelidir.
        Çıktıyı aşağıdaki JSON formatında döndürün:

        [
        {{
            "soru": "Verilen metnin ana konusu nedir?",
            "şıklar": {{
            "A": "Tarih",
            "B": "Bilim",
            "C": "Sanat",
            "D": "Felsefe"
            }},
            "doğru_cevap": "B"
        }},
        {{
            "soru": "Metinde bahsedilen ana karakter kimdir?",
            "şıklar": {{
            "A": "Ali",
            "B": "Veli",
            "C": "Ayşe",
            "D": "Fatma"
            }},
            "doğru_cevap": "A"
        }}
        ]

        Yukarıdaki JSON formatı yalnızca örnek amaçlıdır. Üreteceğiniz sorular ve cevaplar, verilen metne uygun olmalıdır. Örneklerdeki değerleri kullanmayın. Sorularınızı metinden türetin ve doğru cevapları buna göre belirleyin.
        Lütfen sadece JSON formatında cevap verin, başka hiçbir metin eklemeyin.

        Metin: {text}
        """
        
        response = model.generate_content(prompt)
        
        response_text = response.text.strip()
        
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            json_text = response_text
        
        try:
            quiz_data = json.loads(json_text)
        except json.JSONDecodeError:
            cleaned_text = response_text.replace('```json', '').replace('```', '').strip()
            quiz_data = json.loads(cleaned_text)
        
        return JsonResponse({
            'success': True,
            'quiz': quiz_data
        })
        
    except json.JSONDecodeError as e:
        return JsonResponse({'error': f'Invalid JSON in request: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error generating quiz: {str(e)}'}, status=500)


@csrf_exempt
def generate_coaching_report(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        quiz_data = data.get('quiz_data', [])
        user_answers = data.get('user_answers', [])
        original_text = data.get('original_text', '')
        
        if not quiz_data or not user_answers:
            return JsonResponse({'error': 'Quiz data and user answers are required'}, status=400)
        
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # Analyze user performance
        total_questions = len(quiz_data)
        correct_answers = 0
        incorrect_questions = []
        
        for i, question in enumerate(quiz_data):
            correct_index = ['A', 'B', 'C', 'D'].index(question['doğru_cevap'])
            user_answer_index = user_answers[i] if i < len(user_answers) else -1
            
            if user_answer_index == correct_index:
                correct_answers += 1
            else:
                incorrect_questions.append({
                    'question': question['soru'],
                    'user_answer': question['şıklar'][['A', 'B', 'C', 'D'][user_answer_index]] if user_answer_index >= 0 else 'Cevapsız',
                    'correct_answer': question['şıklar'][question['doğru_cevap']],
                    'all_options': question['şıklar']
                })
        
        score_percentage = (correct_answers / total_questions) * 100
        
        # Create coaching prompt
        coaching_prompt = f"""
        Bir öğrencinin quiz performansını analiz et ve eğitici bir geri bildirim raporu hazırla.
        
        QUIZ BİLGİLERİ:
        - Toplam Soru: {total_questions}
        - Doğru Cevap: {correct_answers}
        - Yanlış Cevap: {total_questions - correct_answers}
        - Başarı Oranı: %{score_percentage:.1f}
        
        YANLIŞ CEVAPLANAN SORULAR:
        {chr(10).join([f"Soru: {q['question']}\nÖğrenci Cevabı: {q['user_answer']}\nDoğru Cevap: {q['correct_answer']}\n" for q in incorrect_questions[:3]])}
        
        ORİJİNAL METİN:
        {original_text[:500]}...
        
        Lütfen aşağıdaki JSON formatında kapsamlı bir eğitici rapor hazırla:
        
        {{
            "genel_degerlendirme": "Öğrencinin genel performansı hakkında pozitif ve yapıcı değerlendirme",
            "guclu_yanlar": ["Güçlü olduğu alan 1", "Güçlü olduğu alan 2"],
            "gelisim_alanlari": ["Geliştirilmesi gereken alan 1", "Geliştirilmesi gereken alan 2"],
            "oneriler": [
                "Somut iyileştirme önerisi 1",
                "Somut iyileştirme önerisi 2",
                "Somut iyileştirme önerisi 3"
            ],
            "sonraki_adimlar": [
                "Yapılabilecek çalışma 1",
                "Yapılabilecek çalışma 2"
            ],
            "motivasyon_mesaji": "Öğrenciyi motive edici pozitif mesaj"
        }}
        
        Sadece JSON formatında cevap ver, başka hiçbir metin ekleme.
        """
        
        response = model.generate_content(coaching_prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(0)
        else:
            json_text = response_text
        
        try:
            coaching_data = json.loads(json_text)
        except json.JSONDecodeError:
            cleaned_text = response_text.replace('```json', '').replace('```', '').strip()
            coaching_data = json.loads(cleaned_text)
        
        return JsonResponse({
            'success': True,
            'coaching_report': coaching_data,
            'score_percentage': score_percentage,
            'correct_answers': correct_answers,
            'total_questions': total_questions
        })
        
    except json.JSONDecodeError as e:
        return JsonResponse({'error': f'Invalid JSON in request: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Error generating coaching report: {str(e)}'}, status=500)