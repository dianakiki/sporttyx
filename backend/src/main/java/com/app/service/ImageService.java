package com.app.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.UUID;

@Service
public class ImageService {
    
    private static final int MAX_WIDTH = 800;
    private static final int MAX_HEIGHT = 800;
    private static final float COMPRESSION_QUALITY = 0.85f;
    
    public String saveTeamImage(MultipartFile file) throws IOException {
        String uploadDir = "uploads/teams/";
        return saveImage(file, uploadDir);
    }
    
    public String saveActivityImage(MultipartFile file) throws IOException {
        String uploadDir = "uploads/activities/";
        return saveImage(file, uploadDir);
    }
    
    private String saveImage(MultipartFile file, String uploadDir) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        BufferedImage originalImage;
        try {
            byte[] bytes = file.getBytes();
            ByteArrayInputStream bais = new ByteArrayInputStream(bytes);
            originalImage = ImageIO.read(bais);
        } catch (Exception e) {
            throw new IOException("Failed to read image file: " + file.getOriginalFilename(), e);
        }
        
        if (originalImage == null) {
            throw new IOException("Invalid image file: " + file.getOriginalFilename());
        }
        
        BufferedImage resizedImage = resizeImage(originalImage, MAX_WIDTH, MAX_HEIGHT);
        
        String filename = UUID.randomUUID().toString() + ".jpg";
        Path filePath = uploadPath.resolve(filename);
        
        compressAndSaveImage(resizedImage, filePath);
        
        return "/" + uploadDir + filename;
    }
    
    private BufferedImage resizeImage(BufferedImage originalImage, int maxWidth, int maxHeight) {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return originalImage;
        }
        
        double widthRatio = (double) maxWidth / originalWidth;
        double heightRatio = (double) maxHeight / originalHeight;
        double ratio = Math.min(widthRatio, heightRatio);
        
        int newWidth = (int) (originalWidth * ratio);
        int newHeight = (int) (originalHeight * ratio);
        
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resizedImage.createGraphics();
        
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g.dispose();
        
        return resizedImage;
    }
    
    private void compressAndSaveImage(BufferedImage image, Path outputPath) throws IOException {
        ByteArrayOutputStream compressed = new ByteArrayOutputStream();
        
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByFormatName("jpg");
        if (!writers.hasNext()) {
            throw new IOException("No JPEG writer found");
        }
        
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        
        if (param.canWriteCompressed()) {
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(COMPRESSION_QUALITY);
        }
        
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(compressed)) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(image, null, null), param);
        } finally {
            writer.dispose();
        }
        
        Files.write(outputPath, compressed.toByteArray());
    }
}
