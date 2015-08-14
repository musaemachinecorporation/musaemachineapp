package etc;

import java.awt.image.BufferedImage;
import java.io.InputStream;

import musicg.GraphicRender;
import musicg.Wave;


public class AudioWaveformCreator {
	
	
	public  BufferedImage createWavForm(InputStream ins)throws Exception{
		// create a wave object
		Wave wave = new Wave(ins);
		       
		// Graphic render
		GraphicRender render=new GraphicRender();
		render.setHorizontalMarker(1);
	    float timeStep=0.1f;
		return render.renderWaveform(wave,timeStep,310,200);
		
	}
  
}