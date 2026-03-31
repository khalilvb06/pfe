import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info, Scale, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمحادثة</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="القسطاس" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-bold text-gold">القسطاس</h1>
          </div>
        </header>

        <section className="text-center space-y-4 py-8">
          <h2 className="text-4xl font-extrabold tracking-tight">مساعدك الذكي في القانون الجزائري</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            القسطاس هو منصة متطورة تعتمد على الذكاء الاصطناعي لتقديم استشارات ومعلومات قانونية دقيقة حول التشريعات الجزائرية.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                <Scale className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>دقة قانونية</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              مدرب على قاعدة بيانات شاملة من القوانين والتشريعات الجزائرية المحدثة.
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>سرعة فائقة</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              احصل على إجابات فورية لاستفساراتك القانونية المعقدة في ثوانٍ معدودة.
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>خصوصية تامة</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground">
              نحن نحترم خصوصية بياناتك واستفساراتك، مع تشفير كامل لجميع المحادثات.
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-none shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground p-6">
            <div className="flex items-center gap-3">
              <Info className="w-6 h-6" />
              <CardTitle className="text-xl">حول النظام</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6 text-lg leading-relaxed">
            <p>
              يهدف مشروع <strong>القسطاس</strong> إلى رقمنة وتيسير الوصول إلى المعلومة القانونية في الجزائر. سواء كنت محامياً، طالب حقوق، أو مواطناً يبحث عن توضيح قانوني، فإن القسطاس يوفر لك الأدوات اللازمة لفهم النصوص القانونية بشكل أفضل.
            </p>
            <p>
              يستخدم النظام تقنيات الـ RAG (Retrieval-Augmented Generation) لضمان أن الإجابات مستمدة مباشرة من النصوص القانونية الرسمية، مما يقلل من احتمالية الخطأ ويوفر مراجع دقيقة للمواد القانونية.
            </p>
            <div className="p-4 rounded-lg bg-muted border-r-4 border-primary">
              <p className="text-sm font-medium">
                تنبيه: المعلومات المقدمة من القسطاس هي لأغراض إعلامية وتعليمية فقط، ولا تشكل استشارة قانونية رسمية. يُنصح دائماً بمراجعة المختصين في الحالات القانونية الحرجة.
              </p>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center py-10 text-muted-foreground">
          <p>© 2026 القسطاس - جميع الحقوق محفوظة.</p>
        </footer>
      </div>
    </div>
  );
}
