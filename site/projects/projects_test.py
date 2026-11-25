import unittest
from toolkit import *
class Projects(unittest.TestCase):
    def setUp(self): self.rows,self.errors=clean(read_orders())
    def test_analyze(self): self.assertEqual(analyze(self.rows),{'Web':360,'Shop':140})
    def test_clean(self): self.assertEqual(self.errors,[('S04','invalid'),('S05','duplicate')])
    def test_prediction(self):
        a,b=fit([(1,4),(2,7),(3,10)]);self.assertEqual(a*4+b,13)
        with self.assertRaises(ValueError):fit([(1,3),(1,6)])
    def test_retrieval(self):
        docs={'D1':'Lưu biên bản','D2':'Kiểm tra tồn kho'}
        self.assertEqual(answer('tồn kho',docs)['source'],'D2')
        self.assertIsNone(answer('xyz',docs)['source'])
    def test_tool(self):
        self.assertEqual(execute({'name':'total','channel':'Web'},self.rows),360)
        with self.assertRaises(ValueError):execute({'name':'delete'},self.rows)
    def test_assistant(self):
        self.assertEqual(assistant('Doanh thu Shop?',self.rows)['result'],140)
        self.assertIn('message',assistant('Doanh thu?',self.rows))
    def test_pipeline(self):self.assertEqual(report()['valid'],5)
if __name__=='__main__':unittest.main()
